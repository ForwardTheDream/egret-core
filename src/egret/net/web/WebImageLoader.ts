
//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////


namespace egret.web {

    let winURL = window["URL"] || window["webkitURL"];

    ///refactor
    const _TextureLoaders: IInternalTextureLoader[] = [];


    /////
    /**
     * This represents the required contract to create a new type of texture loader.
     */

    /**
     * Class used to store data associated with WebGL texture data for the engine
     * This class should not be used directly
     */
    export class InternalTexture {
    }

    export interface IInternalTextureLoader {
        /**
         * Defines wether the loader supports cascade loading the different faces.
         */
        supportCascades: boolean;

        /**
         * This returns if the loader support the current file information.
         * @param extension defines the file extension of the file being loaded
         * @param textureFormatInUse defines the current compressed format in use iun the engine
         * @param fallback defines the fallback internal texture if any
         * @param isBase64 defines whether the texture is encoded as a base64
         * @param isBuffer defines whether the texture data are stored as a buffer
         * @returns true if the loader can load the specified file
         */
        canLoad(extension: string, textureFormatInUse: Nullable<string>, fallback: Nullable<InternalTexture>, isBase64: boolean, isBuffer: boolean): boolean;

        /**
         * Transform the url before loading if required.
         * @param rootUrl the url of the texture
         * @param textureFormatInUse defines the current compressed format in use iun the engine
         * @returns the transformed texture
         */
        transformUrl(rootUrl: string, textureFormatInUse: Nullable<string>): string;

        /**
         * Gets the fallback url in case the load fail. This can return null to allow the default fallback mecanism to work
         * @param rootUrl the url of the texture
         * @param textureFormatInUse defines the current compressed format in use iun the engine
         * @returns the fallback texture
         */
        getFallbackTextureUrl(rootUrl: string, textureFormatInUse: Nullable<string>): Nullable<string>;

        /**
         * Uploads the cube texture data to the WebGl Texture. It has alreday been bound.
         * @param data contains the texture data
         * @param texture defines the BabylonJS internal texture
         * @param createPolynomials will be true if polynomials have been requested
         * @param onLoad defines the callback to trigger once the texture is ready
         * @param onError defines the callback to trigger in case of error
         */
        loadCubeData(data: string | ArrayBuffer | (string | ArrayBuffer)[], texture: InternalTexture, createPolynomials: boolean, onLoad: Nullable<(data?: any) => void>, onError: Nullable<(message?: string, exception?: any) => void>): void;

        /**
         * Uploads the 2D texture data to the WebGl Texture. It has alreday been bound once in the callback.
         * @param data contains the texture data
         * @param texture defines the BabylonJS internal texture
         * @param callback defines the method to call once ready to upload
         */
        loadData(data: ArrayBuffer, texture: InternalTexture,
            callback: (width: number, height: number, loadMipmap: boolean, isCompressed: boolean, done: () => void, loadFailed?: boolean) => void): void;
    }
    // import { KhronosTextureContainer } from "../../../Misc/khronosTextureContainer";
    // import { Nullable } from "../../../types";
    // import { Engine } from "../../../Engines/engine";
    // import { InternalTexture } from "../../../Materials/Textures/internalTexture";
    // import { IInternalTextureLoader } from "../../../Materials/Textures/internalTextureLoader";
    // import { _TimeToken } from "../../../Instrumentation/timeToken";
    // import { _DepthCullingState, _StencilState, _AlphaState } from "../../../States/index";
    /**
     * Implementation of the KTX Texture Loader.
     * @hidden
     */
    export class _KTXTextureLoader implements IInternalTextureLoader {
        /**
         * Defines wether the loader supports cascade loading the different faces.
         */
        public readonly supportCascades = false;

        /**
         * This returns if the loader support the current file information.
         * @param extension defines the file extension of the file being loaded
         * @param textureFormatInUse defines the current compressed format in use iun the engine
         * @param fallback defines the fallback internal texture if any
         * @param isBase64 defines whether the texture is encoded as a base64
         * @param isBuffer defines whether the texture data are stored as a buffer
         * @returns true if the loader can load the specified file
         */
        public canLoad(extension: string, textureFormatInUse: Nullable<string>, fallback: Nullable<InternalTexture>, isBase64: boolean, isBuffer: boolean): boolean {
            if (textureFormatInUse && !isBase64 && !fallback && !isBuffer) {
                return true;
            }
            return false;
        }

        /**
         * Transform the url before loading if required.
         * @param rootUrl the url of the texture
         * @param textureFormatInUse defines the current compressed format in use iun the engine
         * @returns the transformed texture
         */
        public transformUrl(rootUrl: string, textureFormatInUse: Nullable<string>): string {
            var lastDot = rootUrl.lastIndexOf('.');
            if (lastDot != -1 && rootUrl.substring(lastDot + 1) == "ktx") {
                // Already transformed
                return rootUrl;
            }
            return (lastDot > -1 ? rootUrl.substring(0, lastDot) : rootUrl) + textureFormatInUse;
        }

        /**
         * Gets the fallback url in case the load fail. This can return null to allow the default fallback mecanism to work
         * @param rootUrl the url of the texture
         * @param textureFormatInUse defines the current compressed format in use iun the engine
         * @returns the fallback texture
         */
        public getFallbackTextureUrl(rootUrl: string, textureFormatInUse: Nullable<string>): Nullable<string> {
            // remove the format appended to the rootUrl in the original createCubeTexture call.
            var exp = new RegExp("" + textureFormatInUse! + "$");
            return rootUrl.replace(exp, "");
        }

        /**
         * Uploads the cube texture data to the WebGl Texture. It has alreday been bound.
         * @param data contains the texture data
         * @param texture defines the BabylonJS internal texture
         * @param createPolynomials will be true if polynomials have been requested
         * @param onLoad defines the callback to trigger once the texture is ready
         * @param onError defines the callback to trigger in case of error
         */
        public loadCubeData(data: string | ArrayBuffer | (string | ArrayBuffer)[], texture: InternalTexture, createPolynomials: boolean, onLoad: Nullable<(data?: any) => void>, onError: Nullable<(message?: string, exception?: any) => void>): void {
            /*
            if (Array.isArray(data)) {
                return;
            }

            // Need to invert vScale as invertY via UNPACK_FLIP_Y_WEBGL is not supported by compressed texture
            texture._invertVScale = !texture.invertY;
            var engine = texture.getEngine();
            var ktx = new KhronosTextureContainer(data, 6);

            var loadMipmap = ktx.numberOfMipmapLevels > 1 && texture.generateMipMaps;

            engine._unpackFlipY(true);

            ktx.uploadLevels(texture, texture.generateMipMaps);

            texture.width = ktx.pixelWidth;
            texture.height = ktx.pixelHeight;

            engine._setCubeMapTextureParams(loadMipmap);
            texture.isReady = true;
            */
        }

        /**
         * Uploads the 2D texture data to the WebGl Texture. It has alreday been bound once in the callback.
         * @param data contains the texture data
         * @param texture defines the BabylonJS internal texture
         * @param callback defines the method to call once ready to upload
         */
        public loadData(data: ArrayBuffer, texture: InternalTexture,
            callback: (width: number, height: number, loadMipmap: boolean, isCompressed: boolean, done: () => void, loadFailed: boolean) => void): void {

            /*
            // Need to invert vScale as invertY via UNPACK_FLIP_Y_WEBGL is not supported by compressed texture
            texture._invertVScale = !texture.invertY;
            var ktx = new KhronosTextureContainer(data, 1);

            callback(ktx.pixelWidth, ktx.pixelHeight, false, true, () => {
                ktx.uploadLevels(texture, texture.generateMipMaps);
            }, ktx.isInvalid);
            */
        }
    }

    // Register the loader.
    //Engine._TextureLoaders.unshift(new _KTXTextureLoader());
    _TextureLoaders.unshift(new _KTXTextureLoader());

    // import { Logger } from "../Misc/logger";
    // import { InternalTexture } from "../Materials/Textures/internalTexture";

    /**
     * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
     * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
     */
    export class KhronosTextureContainer {
        private static HEADER_LEN = 12 + (13 * 4); // identifier + header elements (not including key value meta-data pairs)

        // load types
        private static COMPRESSED_2D = 0; // uses a gl.compressedTexImage2D()
        private static COMPRESSED_3D = 1; // uses a gl.compressedTexImage3D()
        private static TEX_2D = 2; // uses a gl.texImage2D()
        private static TEX_3D = 3; // uses a gl.texImage3D()

        // elements of the header
        /**
         * Gets the openGL type
         */
        public glType: number;
        /**
         * Gets the openGL type size
         */
        public glTypeSize: number;
        /**
         * Gets the openGL format
         */
        public glFormat: number;
        /**
         * Gets the openGL internal format
         */
        public glInternalFormat: number;
        /**
         * Gets the base internal format
         */
        public glBaseInternalFormat: number;
        /**
         * Gets image width in pixel
         */
        public pixelWidth: number;
        /**
         * Gets image height in pixel
         */
        public pixelHeight: number;
        /**
         * Gets image depth in pixels
         */
        public pixelDepth: number;
        /**
         * Gets the number of array elements
         */
        public numberOfArrayElements: number;
        /**
         * Gets the number of faces
         */
        public numberOfFaces: number;
        /**
         * Gets the number of mipmap levels
         */
        public numberOfMipmapLevels: number;
        /**
         * Gets the bytes of key value data
         */
        public bytesOfKeyValueData: number;
        /**
         * Gets the load type
         */
        public loadType: number;
        /**
         * If the container has been made invalid (eg. constructor failed to correctly load array buffer)
         */
        public isInvalid = false;

        /**
         * Creates a new KhronosTextureContainer
         * @param arrayBuffer contents of the KTX container file
         * @param facesExpected should be either 1 or 6, based whether a cube texture or or
         * @param threeDExpected provision for indicating that data should be a 3D texture, not implemented
         * @param textureArrayExpected provision for indicating that data should be a texture array, not implemented
         */
        public constructor(
            /** contents of the KTX container file */
            public arrayBuffer: any, facesExpected: number, threeDExpected?: boolean, textureArrayExpected?: boolean) {
            // Test that it is a ktx formatted file, based on the first 12 bytes, character representation is:
            // '�', 'K', 'T', 'X', ' ', '1', '1', '�', '\r', '\n', '\x1A', '\n'
            // 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
            var identifier = new Uint8Array(this.arrayBuffer, 0, 12);
            if (identifier[0] !== 0xAB || identifier[1] !== 0x4B || identifier[2] !== 0x54 || identifier[3] !== 0x58 || identifier[4] !== 0x20 || identifier[5] !== 0x31 ||
                identifier[6] !== 0x31 || identifier[7] !== 0xBB || identifier[8] !== 0x0D || identifier[9] !== 0x0A || identifier[10] !== 0x1A || identifier[11] !== 0x0A) {
                this.isInvalid = true;
                //Logger.Error("texture missing KTX identifier");
                console.error("texture missing KTX identifier");
                return;
            }

            // load the reset of the header in native 32 bit uint
            var dataSize = Uint32Array.BYTES_PER_ELEMENT;
            var headerDataView = new DataView(this.arrayBuffer, 12, 13 * dataSize);
            var endianness = headerDataView.getUint32(0, true);
            var littleEndian = endianness === 0x04030201;

            this.glType = headerDataView.getUint32(1 * dataSize, littleEndian); // must be 0 for compressed textures
            this.glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian); // must be 1 for compressed textures
            this.glFormat = headerDataView.getUint32(3 * dataSize, littleEndian); // must be 0 for compressed textures
            this.glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian); // the value of arg passed to gl.compressedTexImage2D(,,x,,,,)
            this.glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian); // specify GL_RGB, GL_RGBA, GL_ALPHA, etc (un-compressed only)
            this.pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage2D(,,,x,,,)
            this.pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage2D(,,,,x,,)
            this.pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage3D(,,,,,x,,)
            this.numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian); // used for texture arrays
            this.numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian); // used for cubemap textures, should either be 1 or 6
            this.numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian); // number of levels; disregard possibility of 0 for compressed textures
            this.bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian); // the amount of space after the header for meta-data

            // Make sure we have a compressed type.  Not only reduces work, but probably better to let dev know they are not compressing.
            if (this.glType !== 0) {
                //Logger.Error("only compressed formats currently supported");
                console.error("only compressed formats currently supported");
                return;
            } else {
                // value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
                this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
            }

            if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
                //Logger.Error("only 2D textures currently supported");
                console.error("only 2D textures currently supported");
                return;
            }

            if (this.numberOfArrayElements !== 0) {
                //Logger.Error("texture arrays not currently supported");
                console.error("texture arrays not currently supported");
                return;
            }

            if (this.numberOfFaces !== facesExpected) {
                //Logger.Error("number of faces expected" + facesExpected + ", but found " + this.numberOfFaces);
                console.error("number of faces expected" + facesExpected + ", but found " + this.numberOfFaces);
                return;
            }
            // we now have a completely validated file, so could use existence of loadType as success
            // would need to make this more elaborate & adjust checks above to support more than one load type
            this.loadType = KhronosTextureContainer.COMPRESSED_2D;
        }

        /**
         * Uploads KTX content to a Babylon Texture.
         * It is assumed that the texture has already been created & is currently bound
         * @hidden
         */
        public uploadLevels(texture: InternalTexture, loadMipmaps: boolean): void {
            switch (this.loadType) {
                case KhronosTextureContainer.COMPRESSED_2D:
                    this._upload2DCompressedLevels(texture, loadMipmaps);
                    break;

                case KhronosTextureContainer.TEX_2D:
                case KhronosTextureContainer.COMPRESSED_3D:
                case KhronosTextureContainer.TEX_3D:
            }
        }

        private _upload2DCompressedLevels(texture: InternalTexture, loadMipmaps: boolean): void {
            // initialize width & height for level 1
            var dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
            var width = this.pixelWidth;
            var height = this.pixelHeight;

            var mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;
            for (var level = 0; level < mipmapCount; level++) {
                var imageSize = new Int32Array(this.arrayBuffer, dataOffset, 1)[0]; // size per face, since not supporting array cubemaps
                dataOffset += 4; //image data starts from next multiple of 4 offset. Each face refers to same imagesize field above.
                for (var face = 0; face < this.numberOfFaces; face++) {
                    var byteArray = new Uint8Array(this.arrayBuffer, dataOffset, imageSize);

                    // const engine = texture.getEngine();
                    // engine._uploadCompressedDataToTextureDirectly(texture, this.glInternalFormat, width, height, byteArray, face, level);

                    dataOffset += imageSize; // add size of the image for the next face/mipmap
                    dataOffset += 3 - ((imageSize + 3) % 4); // add padding for odd sized image
                }
                width = Math.max(1.0, width * 0.5);
                height = Math.max(1.0, height * 0.5);
            }
        }
    }





























    /////

    /**
     * @private
     * ImageLoader 类可用于加载图像（JPG、PNG 或 GIF）文件。使用 load() 方法来启动加载。被加载的图像对象数据将存储在 ImageLoader.data 属性上 。
     */
    export class WebImageLoader extends EventDispatcher implements ImageLoader {
        /**
         * @private
         * 使用 load() 方法加载成功的 BitmapData 图像数据。
         */
        public data: BitmapData = null;

        /**
         * @private
         * 当从其他站点加载一个图片时，指定是否启用跨域资源共享(CORS)，默认值为null。
         * 可以设置为"anonymous","use-credentials"或null,设置为其他值将等同于"anonymous"。
         */
        private _crossOrigin: string = null;

        /**
         * @private
         * 标记crossOrigin有没有被设置过,设置过之后使用设置的属性
         */
        private _hasCrossOriginSet: boolean = false;

        public set crossOrigin(value: string) {
            this._hasCrossOriginSet = true;
            this._crossOrigin = value;
        }

        public get crossOrigin(): string {
            return this._crossOrigin;
        }

        /**
         * @private
         * 指定是否启用跨域资源共享,如果ImageLoader实例有设置过crossOrigin属性将使用设置的属性
         */
        public static crossOrigin: string = null;

        /**
         * @private
         */
        private currentImage: HTMLImageElement = null;

        /**
         * @private
         */
        private currentURL: string;

        /**
         * @private
         */
        private request: WebHttpRequest = null;

        /**
         * @private
         * 启动一次图像加载。注意：若之前已经调用过加载请求，重新调用 load() 将终止先前的请求，并开始新的加载。
         * @param url 要加载的图像文件的地址。
         */
        public load(url: string): void {
            if (Html5Capatibility._canUseBlob
                && url.indexOf("wxLocalResource:") != 0//微信专用不能使用 blob
                && url.indexOf("data:") != 0
                && url.indexOf("http:") != 0
                && url.indexOf("https:") != 0) {//如果是base64编码或跨域访问的图片，直接使用Image.src解析。
                let request = this.request;
                if (!request) {
                    request = this.request = new egret.web.WebHttpRequest();
                    request.addEventListener(egret.Event.COMPLETE, this.onBlobLoaded, this);
                    request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onBlobError, this);
                    request.responseType = "blob";
                }
                if (DEBUG) {
                    this.currentURL = url;
                }
                request.open(url);
                request.send();
            }
            else {
                this.loadImage(url);
            }
        }

        /**
         * @private
         */
        private onBlobLoaded(event: egret.Event): void {
            let blob: Blob = this.request.response;
            this.request = undefined;
            this.loadImage(winURL.createObjectURL(blob));
        }

        /**
         * @private
         */
        private onBlobError(event: egret.Event): void {
            this.dispatchIOError(this.currentURL);
            this.request = undefined;
        }

        /**
         * @private
         */
        private loadImage(src: string): void {
            ////refactor
            let url = String(src); // assign a new string, so that the original is still available in case of fallback
            let fromData = url.substr(0, 5) === "data:";
            let fromBlob = url.substr(0, 5) === "blob:";
            let isBase64 = fromData && url.indexOf(";base64,") !== -1;
            ///???????
            let fallback = null;
            let texture = fallback ? fallback : new InternalTexture;//(this, InternalTexture.DATASOURCE_URL);
            let forcedExtension = false;
            let buffer = false;
            let _textureFormatInUse = egret.web.WebGLRenderContext.getInstance(0, 0).textureFormatInUse;//textureFormatInUse();
            //let texture = fallback ? fallback : new InternalTexture(this, InternalTexture.DATASOURCE_URL);

            // establish the file extension, if possible
            var lastDot = url.lastIndexOf('.');
            let extension = forcedExtension ? forcedExtension : (lastDot > -1 ? url.substring(lastDot).toLowerCase() : "");
            ///???
            if (extension === 'ktx') {
                extension = '';
            }
            ////
            let loader: Nullable<IInternalTextureLoader> = null;
            for (let availableLoader of /*Engine.*/_TextureLoaders) {
                if (/*excludeLoaders.indexOf(availableLoader) === -1 && */availableLoader.canLoad(extension, /*this.*/_textureFormatInUse, fallback, isBase64, buffer ? true : false)) {
                    loader = availableLoader;
                    break;
                }
            }
            if (loader) {
                url = loader.transformUrl(url, /*this.*/_textureFormatInUse);
            }

            // processing for non-image formats
            if (loader) {
                var callback = (data: string | ArrayBuffer) => {
                    loader!.loadData(data as ArrayBuffer, texture, (width: number, height: number, loadMipmap: boolean, isCompressed: boolean, done: () => void, loadFailed) => {
                        if (loadFailed) {
                            //onInternalError("TextureLoader failed to load data");
                        } else {
                            /*
                            this._prepareWebGLTexture(texture, scene, width, height, texture.invertY, !loadMipmap, isCompressed, () => {
                                done();
                                return false;
                            }, samplingMode);
                            */
                        }
                    });
                };

                if (!buffer) {
                    // this._loadFile(url, callback, undefined, scene ? scene.offlineProvider : undefined, true, (request?: WebRequest, exception?: any) => {
                    //     onInternalError("Unable to load " + (request ? request.responseURL : url, exception));
                    // });
                } else {
                    callback(buffer as ArrayBuffer);
                }
            }
            ////








            let image = new Image();
            this.data = null;
            this.currentImage = image;
            if (this._hasCrossOriginSet) {
                if (this._crossOrigin) {
                    image.crossOrigin = this._crossOrigin;
                }
            }
            else {
                if (WebImageLoader.crossOrigin) {
                    image.crossOrigin = WebImageLoader.crossOrigin;
                }
            }
            /*else {
                if (image.hasAttribute("crossOrigin")) {//兼容猎豹
                    image.removeAttribute("crossOrigin");
                }
            }*/
            image.onload = this.onImageComplete.bind(this);
            image.onerror = this.onLoadError.bind(this);
            image.src = src;
        }

        /**
         * @private
         */
        private onImageComplete(event): void {
            let image = this.getImage(event);
            if (!image) {
                return;
            }
            this.data = new egret.BitmapData(image);
            let self = this;
            window.setTimeout(function (): void {
                self.dispatchEventWith(Event.COMPLETE);
            }, 0);
        }

        /**
         * @private
         */
        private onLoadError(event): void {
            let image = this.getImage(event);
            if (!image) {
                return;
            }
            this.dispatchIOError(image.src);
        }

        private dispatchIOError(url: string): void {
            let self = this;
            window.setTimeout(function (): void {
                if (DEBUG && !self.hasEventListener(IOErrorEvent.IO_ERROR)) {
                    $error(1011, url);
                }
                self.dispatchEventWith(IOErrorEvent.IO_ERROR);
            }, 0);
        }

        /**
         * @private
         */
        private getImage(event: any): HTMLImageElement {
            let image: HTMLImageElement = event.target;
            let url: string = image.src;
            if (url.indexOf("blob:") == 0) {
                try {
                    winURL.revokeObjectURL(image.src);
                }
                catch (e) {
                    egret.$warn(1037);
                }
            }
            image.onerror = null;
            image.onload = null;
            if (this.currentImage !== image) {
                return null;
            }
            this.currentImage = null;
            return image;
        }

    }

    ImageLoader = WebImageLoader;
}
