import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'made-with-docspa', // tslint:disable-line
  template: `
    <ng-template #noUrl>
      by
      <ng-content></ng-content>
      <slot></slot>
      {{name}}
    </ng-template>
    <span [style.font-size.em]="size">
      Made with <a href="https://github.com/swimlane/docspa"><span [style.color]="'red'">Doc</span>
      <span [style.color]="'blue'">SPA</span></a>
      <ng-container *ngIf="url && url.length > 0; else noUrl">
        by
        <a [attr.href]="url" target="_blank" [style.color]="color">
          <ng-content></ng-content>
          <slot></slot>
          {{name}}
        </a>
      </ng-container>
    </span>
  `,
  styles: [`
  :host {
    span {
      a {
        color: #000;
        font-weight: bold;
      }
    }
  }
  `]
})
export class MadeWithDocSPAComponent implements OnInit {
  @Input()
  public name: string;

  @Input()
  public url: string;

  @Input()
  public color = 'red';

  @Input()
  public size = 0.5;

  ngOnInit() {
    if (!this.name || this.name.length === 0) {
      console.error(`Name attribute must be provided!`);
    }
  }
}
