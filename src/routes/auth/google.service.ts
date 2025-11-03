import { BadRequestException, Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { AuthRepository } from './auth.repo'
import { SharedUserRepo } from 'src/shared/repositories/shared-user.repo'

import { RoleService } from './role.service'
import { v4 as uuidv4 } from 'uuid'
import { HashingService } from 'src/shared/service/hashing.service'
import { AuthService } from './auth.service'

@Injectable()
export class GoogleService {
  private readonly oauth2Client: OAuth2Client

  constructor(
    private readonly sharedUserRepo: SharedUserRepo,
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_SECRET_ID,
      process.env.GOOGLE_REDIRECT,
    )
  }
  async googleLink(userAgent: string, ip: string) {
    const scope = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
    const stateString = JSON.stringify({
      userAgent,
      ip,
    })
    console.log(stateString)
    const state = Buffer.from(stateString).toString('base64')
    console.log(state)
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state,
    })
    return {
      link: authUrl,
    }
  }

  async googleCallback(code: string, state: string) {
    try {
      let userAgent = 'Unknown'
      let ip = 'Unknown'
      try {
        const stateString = Buffer.from(state, 'base64').toString('utf-8')
        userAgent = JSON.parse(stateString).userAgent
        ip = JSON.parse(stateString).ip
      } catch (error) {
        console.log(error)
        throw new BadRequestException('Invalid state')
      }
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)
      const user = await google.oauth2({ version: 'v2', auth: this.oauth2Client }).userinfo.get()
      if (!user.data.email) {
        throw new BadRequestException('Invalid email')
      }
      const userData = await this.authRepository.getUserByEmailIncludeRoleAndDevice(user.data.email)
      const clientRole = await this.roleService.getClientRole()
      let newUserId = userData?.id
      let roleName = (userData as any)?.userRoles?.[0]?.role.name
      if (!userData) {
        const passwordRandom = uuidv4()
        const hashedPassword = await this.hashingService.hashPassword(passwordRandom)
        const newUser = await this.authRepository.createUser({
          email: user.data.email || '',
          password: hashedPassword,
          name: user.data.name || '',
          phoneNumber: '',
          avatar: user.data.picture || null,
        })
        await this.authRepository.attachRoleToUser(newUser.id, clientRole)
        const newUserWithRole = await this.authRepository.getUserByEmailIncludeRoleAndDevice(newUser.email)
        if (!newUserWithRole) {
          throw new BadRequestException('Failed to create user')
        }
        newUserId = newUserWithRole.id
        roleName = (newUserWithRole as any).userRoles?.[0]?.role.name
      }
      const device = await this.authRepository.createDevice({
        userId: newUserId!,
        userAgent,
        ipAddress: ip,
        lastActiveAt: new Date(),
        isActive: true,
      })

      const authToken = await this.authService.generateTokens(newUserId! , device.id, clientRole, roleName!)
      return authToken
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Invalid code or state')
    }
  }
}
