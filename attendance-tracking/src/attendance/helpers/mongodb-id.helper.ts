import { Injectable } from '@nestjs/common';
import { Document } from 'mongoose';

@Injectable()
export class MongoDBIdHelper {
  static getId(document: Document): string {
    return document.id?.toString() || document._id?.toString() || '';
  }

  static isValidId(id: any): boolean {
    if (!id) return false;

    // Verificar si es un ObjectId válido (24 caracteres hexadecimales)
    if (typeof id === 'string') {
      return /^[0-9a-fA-F]{24}$/.test(id);
    }

    // Si es un objeto ObjectId de Mongoose
    if (id && typeof id === 'object' && id.toString) {
      return /^[0-9a-fA-F]{24}$/.test(id.toString());
    }

    return false;
  }

  static findDocumentById(documents: Document[], searchId: string): Document | undefined {
    return documents.find((doc) => this.getId(doc) === searchId);
  }
}
