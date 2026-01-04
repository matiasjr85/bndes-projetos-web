import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class PtBrDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (value == null) return null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;

      // ✅ Só aceita dd/MM/yyyy COMPLETO
      const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
      if (!match) return null;

      const dd = Number(match[1]);
      const mm = Number(match[2]);
      const yyyy = Number(match[3]);

      if (mm < 1 || mm > 12) return null;
      if (dd < 1 || dd > 31) return null;

      const d = new Date(yyyy, mm - 1, dd);

      // evita overflow: 31/02 virar março
      if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) {
        return null;
      }

      return d;
    }

    return null;
  }
}
