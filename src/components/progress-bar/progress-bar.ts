import { Component, Input, ChangeDetectorRef } from '@angular/core';

/**
 * Generated class for the ProgressBarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'progress-bar',
  templateUrl: 'progress-bar.html'
})
export class ProgressBarComponent {
  @Input('progress') progress;

  constructor(private _changeDetectionRef : ChangeDetectorRef) {
    
  }

  ngOnChanges(){
      this._changeDetectionRef.detectChanges(); 
  }

}
