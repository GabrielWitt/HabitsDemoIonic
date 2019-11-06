import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalTestArticlePage } from './modal-test-article';

@NgModule({
  declarations: [
    ModalTestArticlePage,
  ],
  imports: [
    IonicPageModule.forChild(ModalTestArticlePage),
  ],
})
export class ModalTestArticlePageModule {}
