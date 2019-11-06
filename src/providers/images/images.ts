import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireStorage } from "@angular/fire/storage";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';
//import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform, Loading } from 'ionic-angular';
import { ImageLoader ,ImageLoaderConfig  } from 'ionic-image-loader';

@Injectable()
export class ImagesProvider {
  loaderImage: Loading;

  constructor(
    public http: HttpClient, 
    //private imagePicker: ImagePicker,
    private camera: Camera,
    private crop: Crop,
    private fireStorage: AngularFireStorage, 
    public platform: Platform,
    //public androidPermissions: AndroidPermissions,
    public imageLoaderConfig: ImageLoaderConfig,
    public imageLoader: ImageLoader
  ){
  }

  /*public permissionCheck(){
    this.imagePicker.hasReadPermission().then(status => {
      if(!status){this.imagePicker.requestReadPermission()}
    })
  }

  public addImage(): Promise<string> {
    return new Promise((resolve,rejected)=> {
      this.imagePicker.getPictures({width: 250,height: 250,}).then((results) => {
        if(results=="OK"){
          return rejected("Se debe proporcionar permiso para que la aplicación pueda accesar a la galeria");
        }
        for (var i = 0; i < results.length; i++) {
            this.imageResize(results[i]).then(url=>{
              if(url!="error"){
                resolve(url)
              }else{
                resolve(results[i])
              }
            });
        }
      },
      (err) => {
          alert(JSON.stringify(err));
          if(err=="20"){
            return rejected("Se debe proporcionar permiso para que la aplicación pueda accesar a la galeria")
          }else{
            if(err=="No Image Selected"){
              return rejected("");
            }else{
              return rejected(err)
            }
          }
      });
    })
  }*/

  public addCameraPhoto(x,resize): Promise<string> {
    return new Promise((resolve,rejected) => {
      const options: CameraOptions = {
        quality: 100,
		    targetWidth: 1024,
        targetHeight: 1024,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        sourceType:x
      }    
      console.log("addCameraPhoto "+JSON.stringify(options));
      this.camera.getPicture(options)
      .then(file_uri => {
        console.log("addCameraPhotoTHEN: "+file_uri )
        if(resize){
          this.imageResize(file_uri).then(url=>{
            if(url!="error"){
              resolve(url)
            }else{
              rejected("Se debe recortar la imagen que fue seleccionada");
            }
          });
        }else{
          resolve(file_uri);
        }
      },
      err => {
        console.log("addCameraPhotoERROR")
        console.log(JSON.stringify(err))
          if(err=="20"){
            if(x==1){
              rejected("Se debe proporcionar permiso para que la aplicación pueda utilizar la camara")
            }else{
              rejected("Se debe proporcionar permiso para que la aplicación pueda accesar a la galeria")
            }
          }else{
            if(err=="No Image Selected"){
              rejected("");
            }else{
              console.log(JSON.stringify(err))
              rejected(err)
            }
          }
      });
    });
  }

  private imageResize(uri): Promise<string> {
    return new Promise(resolve => {
      console.log("addCameraPhoto")
      this.crop.crop(uri, {quality: 100,targetHeight:-1,targetWidth:-1}).then(
      newImage => {
        resolve(newImage);
      },
      error => {
        console.log("error "+JSON.stringify(error))
        resolve("error "+JSON.stringify(error))
      })
    })
  }  
  
  public upload_image(url, name, directory, callback): Promise<string>{
      return new Promise((resolve, rejected) => {
        let file = url;
        if (this.platform.is('android')) file = window['Ionic'].WebView.convertFileSrc(url); //file=file.replace("http://localhost:8080/","http://localhost:8100/")
        let task = this.fireStorage.storage.ref().child(directory+"/"+name+".jpg")
        this.http.get(file,{responseType: 'blob'}).subscribe(data => {
          let upload = task.put(data)
          upload.on('state_changed', function(snapshot){
            let progress = (snapshot['bytesTransferred'] / snapshot['totalBytes']) * 100;
            callback(progress)
          });
          upload.then(Url => {
              let downloadUrl = Url.ref.getDownloadURL();
              resolve(downloadUrl);
          },(error) => {rejected(error)})
        })
      })
    }

    /*Funciones para cachear imagenes*/
    configCacheImages(){
      this.imageLoaderConfig.enableDebugMode(); 
      this.imageLoaderConfig.enableSpinner(false);
      this.imageLoaderConfig.setFallbackUrl('assets/placeholder.jpg');
      this.imageLoaderConfig.enableFallbackAsPlaceholder(true);
    }


    verificarExiste(url):Promise<string>{
      return new Promise((resolve,rejected)=>{
        this.imageLoader.getCachedImagePath(url).then(data=>{
          return resolve(data);
        }).catch(error=>{
          return resolve("NoFile.png");
        });
      })
    }

    addSrcMessage(message){
      this.verificarExiste(message.message).then(src=>{
          src!="NoFile.png"?message.src=message.message:message.src="NoFile.png";
      });
    }
}
