import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { ProgressBarComponent } from './progress-bar/progress-bar';
import { CardNewsComponent } from './card-news/card-news';
import { CardRemindersComponent } from './card-reminders/card-reminders';
import { DietCardsComponent } from './diet-cards/diet-cards';
import { CardHabitComponent } from './card-habit/card-habit';
import { CardUserComponent } from '../components/card-user/card-user';
import { IonicImageLoader } from 'ionic-image-loader';
import { EditMembersComponent } from './edit-members/edit-members';
import { PipesModule } from  '../pipes/pipes.module'
import { ChatbotComponent } from './chatbot/chatbot';
import { ChartComponent } from './chart/chart';

@NgModule({
    exports: [
        CardUserComponent,
        ProgressBarComponent,
        CardNewsComponent,
        CardRemindersComponent,
        DietCardsComponent,
        CardHabitComponent,
        EditMembersComponent,
        ChatbotComponent,
        ChartComponent
    ],
    declarations: [
        CardUserComponent,
        ProgressBarComponent,
        CardNewsComponent,
        CardRemindersComponent,
        DietCardsComponent,
        CardHabitComponent,
        EditMembersComponent,
        ChatbotComponent,
        ChartComponent
    ],
    imports: [
        IonicModule,
        IonicImageLoader,
		PipesModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule { }
