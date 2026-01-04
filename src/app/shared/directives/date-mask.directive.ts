import { Directive, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Máscara simples para datas no formato dd/MM/yyyy.
 *
 * Importante: além de formatar o input, esta diretiva também
 * converte a entrada (quando completa) em um objeto Date no FormControl.
 * Assim, o MatDatepicker + validators funcionam corretamente mesmo quando
 * o usuário digita a data.
 */
@Directive({
  selector: '[appDateMask]',
  standalone: true
})
export class DateMaskDirective {
  constructor(@Optional() private ngControl: NgControl) {}

  private format(digits: string): string {
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);

    let out = d;
    if (m) out += `/${m}`;
    if (y) out += `/${y}`;
    return out;
  }

  private parseDdMmYyyy(digits: string): Date | null {
    if (digits.length !== 8) return null;

    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));

    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
    if (year < 1900 || year > 2200) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    const date = new Date(year, month - 1, day);

    // valida "roundtrip" (ex.: 31/02 vira março -> inválido)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

    return date;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);

    // exibe sempre com máscara
    input.value = this.format(digits);

    const control = this.ngControl?.control;
    if (!control) return;

    if (digits.length === 0) {
      control.setValue(null, { emitEvent: true });
      return;
    }

    if (digits.length < 8) {
      // ainda incompleto -> consideramos inválido e mantemos null
      control.setValue(null, { emitEvent: true });
      return;
    }

    const parsed = this.parseDdMmYyyy(digits);
    control.setValue(parsed, { emitEvent: true });
  }
}
