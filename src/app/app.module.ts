import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { MyApp } from './app.component';

//Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FIREBASE_CONFIG } from './app.firebase';
import { AppContants } from './app.constants';

//Plugins
import { ImageViewerController, ImageViewerComponent, IonicImageViewerModule  } from 'ionic-img-viewer';
import { Network } from '@ionic-native/network';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Firebase } from '@ionic-native/firebase';
import { Device } from '@ionic-native/device';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Health } from '@ionic-native/health';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';
import { PopoverPage } from '../pages/diet/PopoverPage';
import { Keyboard } from '@ionic-native/keyboard';
import { File } from '@ionic-native/file';
import { IonicImageLoader } from 'ionic-image-loader';
import { ParticleEffectButtonModule } from "angular-particle-effect-button";
import { IonicStorageModule } from '@ionic/storage';

//Pipes
import { PipesModule } from  '../pipes/pipes.module';

//Provider
import { AuthProvider } from '../providers/auth/auth'; 
import { ChatProvider } from '../providers/chat/chat';
import { UserProvider } from '../providers/user/user';
import { MainProvider } from '../providers/main/main';
import { RegisterProvider } from '../providers/register/register';
import { HealthProvider } from '../providers/health/health';
import { TestProvider } from '../providers/test/test';
import { HabitProvider } from '../providers/habit/habit';
import { ImagesProvider } from '../providers/images/images';
import { LearningProvider } from '../providers/learning/learning';
import { DietProvider } from '../providers/diet/diet';
import { NewsProvider } from '../providers/news/news';
import { Realtime } from '../providers/social/social';
import { NotificationProvider } from '../providers/notification/notification';
import { PushNotificationProvider } from '../providers/push-notification/push-notification';
import { PointsProvider } from '../providers/points/points';
import { loadingProvider } from '../providers/alert/alert';
import { rankingProvider } from '../providers/ranking/ranking';
import { AnalyticsProvider } from '../providers/analytics/analytics';
import { ComponentsModule } from '../components/components.module';
import { ErrorProvider } from '../providers/error/error';
import { SettingsProvider } from '../providers/settings/settings';
import { RetosProvider } from '../providers/retos/retos';
import { FunctionsProvider } from '../providers/functions/functions';
import { ObservableProvProvider } from '../providers/observable-prov/observable-prov'; 

@NgModule({
  declarations: [
    MyApp,
    PopoverPage,
    //ImageViewerComponent,
  ],
  imports: [
    ComponentsModule,
    BrowserModule,
    IonicModule.forRoot(MyApp,{backButtonText: '' }),
    IonicImageLoader.forRoot(),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(FIREBASE_CONFIG[AppContants.config_mode]),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    IonicImageViewerModule,
    AngularFirestoreModule.enablePersistence(),
    HttpClientModule,
    PipesModule,
	  ParticleEffectButtonModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PopoverPage,
    ImageViewerComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Network,
    LocalNotifications,
    Health,
    AuthProvider,
    ChatProvider,
    UserProvider,
    MainProvider,
    RegisterProvider,
    HealthProvider,
    PushNotificationProvider,
    TestProvider,
    HabitProvider,
    ImagesProvider,
    RetosProvider,
    Camera,
    Crop,
    AngularFireStorage,
    LearningProvider,
    DietProvider,
    ImageViewerController,
    NewsProvider,
    Keyboard,
    Realtime,
    NotificationProvider,
    Firebase,
    Device,
    PointsProvider,
    loadingProvider,
    rankingProvider,
    AnalyticsProvider,
    File,
    ErrorProvider,
    RetosProvider,
    SettingsProvider,
    FunctionsProvider,
    ObservableProvProvider
  ]
})
export class AppModule {}