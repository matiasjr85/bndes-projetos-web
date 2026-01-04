import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDateMask]',
  standalone: true,
})
export class DateMaskDirective {
  private readonly MAX_DIGITS = 8; // ddMMyyyy
  private readonly MAX_LEN = 10;   // dd/MM/yyyy

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private ngControl: NgControl
  ) {}

  // ✅ bloqueia letras e mantém navegação/atalhos
  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];

    if (allowed.includes(e.key)) return;

    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    const input = this.el.nativeElement;
    if (input.value.length >= this.MAX_LEN) e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, this.MAX_DIGITS);
    const masked = this.applyMask(digits);

    const input = this.el.nativeElement;
    input.value = masked;

    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  @HostListener('input')
  onInput() {
    const input = this.el.nativeElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, this.MAX_DIGITS);

    input.value = this.applyMask(digits).slice(0, this.MAX_LEN);

    const control = this.ngControl?.control;
    if (!control) return;

    // ✅ se limpou, zera de verdade
    if (digits.length === 0) {
      control.setValue(null, { emitEvent: true });
      return;
    }

    // ✅ só seta Date quando COMPLETO
    if (digits.length === 8) {
      const parsed = this.parseDdMmYyyy(digits);
      control.setValue(parsed, { emitEvent: true });
    }
    // ✅ se incompleto: NÃO mexe no valor do control (evita “autocompletes”/trocas)
  }

  private applyMask(digits: string): string {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  private parseDdMmYyyy(digits: string): Date | null {
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));

    if (year < 1900 || year > 2200) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    const d = new Date(year, month - 1, day);

    // roundtrip (31/02 etc)
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;

    return d;
  }
}
