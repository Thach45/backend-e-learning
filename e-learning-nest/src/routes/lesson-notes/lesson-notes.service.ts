import { Injectable } from "@nestjs/common";
import { LessonNotesRepository } from "./lesson-notes.repo";
import { CreateLessonNoteBody, UpdateLessonNoteBody } from "./lesson-notes.model";

@Injectable()
export class LessonNotesService {
  constructor(private readonly repo: LessonNotesRepository) {}

  async getNotes(lessonId: string, userId: string) {
    return this.repo.getNotes(lessonId, userId);
  }

  async createNote(lessonId: string, userId: string, body: CreateLessonNoteBody) {
    return this.repo.createNote(lessonId, userId, body);
  }

  async updateNote(noteId: string, userId: string, body: UpdateLessonNoteBody) {
    return this.repo.updateNote(noteId, userId, body);
  }

  async deleteNote(noteId: string, userId: string) {
    return this.repo.deleteNote(noteId, userId);
  }
}
