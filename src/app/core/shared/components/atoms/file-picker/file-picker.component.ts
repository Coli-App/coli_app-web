import { Component, ElementRef, ViewChild, signal, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-picker',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './file-picker.component.html',
  styleUrl: './file-picker.component.scss',
})
export class FilePickerComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  accept = input<string>('image/*');
  maxSize = input<number>(5 * 1024 * 1024);
  placeholder = input<string>('Arrastra una imagen aquí o haz clic para seleccionar');
  hint = input<string>('PNG, JPG hasta 5MB');
  required = input<boolean>(false);
  disabled = input<boolean>(false);

  fileSelected = output<File>();
  fileRemoved = output<void>();

  imagePreview = signal<string | null>(null);
  isDragOver = signal<boolean>(false);
  selectedFile = signal<File | null>(null);

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.clearFile();
      }
    });
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled()) return;

    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled()) return;

    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onFileDrop(event: DragEvent): void {
    if (this.disabled()) return;

    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    if (this.disabled()) return;

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const acceptedTypes = this.accept().split(',').map(t => t.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === type;
    });

    if (!isValidType) {
      alert('Por favor selecciona un archivo válido');
      this.resetFileInput();
      return;
    }

    if (file.size > this.maxSize()) {
      const maxSizeMB = (this.maxSize() / (1024 * 1024)).toFixed(1);
      alert(`El archivo no debe superar los ${maxSizeMB}MB`);
      this.resetFileInput();
      return;
    }

    this.selectedFile.set(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.imagePreview.set(result);
      };
      reader.readAsDataURL(file);
    }

    this.fileSelected.emit(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.clearFile();
    this.fileRemoved.emit();
  }

  triggerFileInput(): void {
    if (this.disabled()) return;
    this.fileInput.nativeElement.click();
  }

  private clearFile(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.resetFileInput();
  }

  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  public clear(): void {
    this.clearFile();
  }
}
