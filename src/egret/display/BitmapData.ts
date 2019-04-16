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

namespace egret {

    /**
     * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
     * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
     */
    export class KhronosTextureContainer {
        public static readonly HEADER_LEN = 12 + (13 * 4); // identifier + header elements (not including key value meta-data pairs)

        // load types
        public static readonly COMPRESSED_2D = 0; // uses a gl.compressedTexImage2D()
        public static readonly COMPRESSED_3D = 1; // uses a gl.compressedTexImage3D()
        public static readonly TEX_2D = 2; // uses a gl.texImage2D()
        public static readonly TEX_3D = 3; // uses a gl.texImage3D()

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
                return;
            } else {
                // value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
                this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
            }

            if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
                //Logger.Error("only 2D textures currently supported");
                return;
            }

            if (this.numberOfArrayElements !== 0) {
                //Logger.Error("texture arrays not currently supported");
                return;
            }

            if (this.numberOfFaces !== facesExpected) {
                //Logger.Error("number of faces expected" + facesExpected + ", but found " + this.numberOfFaces);
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
        public uploadLevels(bitmapData: egret.BitmapData/*texture: InternalTexture*/, loadMipmaps: boolean): void {
            switch (this.loadType) {
                case KhronosTextureContainer.COMPRESSED_2D:
                    this._upload2DCompressedLevels(bitmapData, loadMipmaps);
                    break;

                case KhronosTextureContainer.TEX_2D:
                case KhronosTextureContainer.COMPRESSED_3D:
                case KhronosTextureContainer.TEX_3D:
            }
        }

        private _upload2DCompressedLevels(bitmapData: egret.BitmapData,/*texture: InternalTexture,*/ loadMipmaps: boolean): void {
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

                    /*
                    const engine = texture.getEngine();
                    engine._uploadCompressedDataToTextureDirectly(texture, this.glInternalFormat, width, height, byteArray, face, level);
                    */
                    dataOffset += imageSize; // add size of the image for the next face/mipmap
                    dataOffset += 3 - ((imageSize + 3) % 4); // add padding for odd sized image

                }
                width = Math.max(1.0, width * 0.5);
                height = Math.max(1.0, height * 0.5);
            }
        }
    }


    /**
     * A BitmapData object contains an array of pixel data. This data can represent either a fully opaque bitmap or a
     * transparent bitmap that contains alpha channel data. Either type of BitmapData object is stored as a buffer of 32-bit
     * integers. Each 32-bit integer determines the properties of a single pixel in the bitmap.<br/>
     * Each 32-bit integer is a combination of four 8-bit channel values (from 0 to 255) that describe the alpha transparency
     * and the red, green, and blue (ARGB) values of the pixel. (For ARGB values, the most significant byte represents the
     * alpha channel value, followed by red, green, and blue.)
     * @see egret.Bitmap
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * BitmapData 对象是一个包含像素数据的数组。此数据可以表示完全不透明的位图，或表示包含 Alpha 通道数据的透明位图。
     * 以上任一类型的 BitmapData 对象都作为 32 位整数的缓冲区进行存储。每个 32 位整数确定位图中单个像素的属性。<br/>
     * 每个 32 位整数都是四个 8 位通道值（从 0 到 255）的组合，这些值描述像素的 Alpha 透明度以及红色、绿色、蓝色 (ARGB) 值。
     * （对于 ARGB 值，最高有效字节代表 Alpha 通道值，其后的有效字节分别代表红色、绿色和蓝色通道值。）
     * @see egret.Bitmap
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    export class BitmapData extends HashObject {
        /**
         * The width of the bitmap image in pixels.
         * @readOnly
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 位图图像的宽度，以像素为单位。
         * @readOnly
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        width: number;
        /**
         * The height of the bitmap image in pixels.
         * @readOnly
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 位图图像的高度，以像素为单位。
         * @readOnly
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        height: number;

        /**
         * Original bitmap image.
         * HTMLImageElement|HTMLCanvasElement|HTMLVideoElement
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         * @language en_US
         */
        /**
         * 原始位图图像。
         * HTMLImageElement|HTMLCanvasElement|HTMLVideoElement
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         * @language zh_CN
         */
        $source: any;

        /**
         * WebGL texture.
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         * @language en_US
         */
        /**
         * WebGL纹理。
         * @version Egret 2.4
         * @platform Web,Native
         * @private
         * @language zh_CN
         */
        webGLTexture: any;

        /**
         * Texture format.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 纹理格式。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        format: string = "image";

        /**
         * @private
         * webgl纹理生成后，是否删掉原始图像数据
         */
        $deleteSource: boolean = true;

        /**
         * @private
         * id
         */
        public $nativeBitmapData: egret_native.NativeBitmapData;

        /**
         * @public
         * KhronosTextureContainer
         */
        public ktx: KhronosTextureContainer = null;

        /**
         * Initializes a BitmapData object to refer to the specified source object.
         * @param source The source object being referenced.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 创建一个引用指定 source 实例的 BitmapData 对象
         * @param source 被引用的 source 实例
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        constructor(source) {
            super();
            if (egret.nativeRender) {
                let nativeBitmapData = new egret_native.NativeBitmapData();
                nativeBitmapData.$init();
                this.$nativeBitmapData = nativeBitmapData;
            }
            this.source = source;
            if (this.source && (this.source instanceof HTMLImageElement)) {
                this.width = source.width;
                this.height = source.height;
            }
        }

        public get source(): any {
            return this.$source;
        }

        public set source(value: any) {
            this.$source = value;
            if (egret.nativeRender) {
                egret_native.NativeDisplayObject.setSourceToNativeBitmapData(this.$nativeBitmapData, value);
            }
        }

        public static create(type: "arraybuffer", data: ArrayBuffer, callback?: (bitmapData: BitmapData) => void): BitmapData;
        public static create(type: "base64", data: string, callback?: (bitmapData: BitmapData) => void): BitmapData;
        public static create(type: "arraybuffer" | "base64", data: ArrayBuffer | string, callback?: (bitmapData: BitmapData) => void): BitmapData {
            let base64 = "";
            if (type === "arraybuffer") {
                base64 = egret.Base64Util.encode(data as ArrayBuffer);
            }
            else {
                base64 = data as string;
            }
            let imageType = "image/png";//default value
            if (base64.charAt(0) === '/') {
                imageType = "image/jpeg";
            } else if (base64.charAt(0) === 'R') {
                imageType = "image/gif";
            } else if (base64.charAt(0) === 'i') {
                imageType = "image/png";
            }
            let img: HTMLImageElement = new Image();
            img.src = "data:" + imageType + ";base64," + base64;
            img.crossOrigin = '*';
            let bitmapData = new BitmapData(img);
            img.onload = function () {
                img.onload = undefined;
                bitmapData.source = img;
                bitmapData.height = img.height;
                bitmapData.width = img.width;
                if (callback) {
                    callback(bitmapData);
                }
            }
            return bitmapData;
        }

        public $dispose(): void {
            if (Capabilities.renderMode == "webgl" && this.webGLTexture) {
                egret.WebGLUtils.deleteWebGLTexture(this.webGLTexture);
                this.webGLTexture = null;
            }
            //native or WebGLRenderTarget
            if (this.source && this.source.dispose) {
                this.source.dispose();
            }
            this.source = null;
            if (egret.nativeRender) {
                egret_native.NativeDisplayObject.disposeNativeBitmapData(this.$nativeBitmapData);
            }
            BitmapData.$dispose(this);
        }



        private static _displayList = egret.createMap<DisplayObject[]>();
        static $addDisplayObject(displayObject: DisplayObject, bitmapData: BitmapData): void {
            if (!bitmapData) {
                return;
            }
            let hashCode: number = bitmapData.hashCode;
            if (!hashCode) {
                return;
            }
            if (!BitmapData._displayList[hashCode]) {
                BitmapData._displayList[hashCode] = [displayObject];
                return;
            }
            let tempList: Array<DisplayObject> = BitmapData._displayList[hashCode];
            if (tempList.indexOf(displayObject) < 0) {
                tempList.push(displayObject);
            }
        }

        static $removeDisplayObject(displayObject: DisplayObject, bitmapData: BitmapData): void {
            if (!bitmapData) {
                return;
            }
            let hashCode: number = bitmapData.hashCode;
            if (!hashCode) {
                return;
            }
            if (!BitmapData._displayList[hashCode]) {
                return;
            }
            let tempList: Array<DisplayObject> = BitmapData._displayList[hashCode];
            let index: number = tempList.indexOf(displayObject);
            if (index >= 0) {
                tempList.splice(index, 1);
            }
        }

        static $invalidate(bitmapData: BitmapData): void {
            if (!bitmapData) {
                return;
            }
            let hashCode: number = bitmapData.hashCode;
            if (!hashCode) {
                return;
            }
            if (!BitmapData._displayList[hashCode]) {
                return;
            }
            let tempList: Array<DisplayObject> = BitmapData._displayList[hashCode];
            for (let i: number = 0; i < tempList.length; i++) {
                if (tempList[i] instanceof egret.Bitmap) {
                    (<egret.Bitmap>tempList[i]).$refreshImageData();
                }
                let bitmap = tempList[i];
                bitmap.$renderDirty = true;
                let p = bitmap.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = bitmap.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }

        static $dispose(bitmapData: BitmapData): void {
            if (!bitmapData) {
                return;
            }
            let hashCode: number = bitmapData.hashCode;
            if (!hashCode) {
                return;
            }
            if (!BitmapData._displayList[hashCode]) {
                return;
            }
            let tempList = BitmapData._displayList[hashCode];
            for (let node of tempList) {
                if (node instanceof egret.Bitmap) {
                    node.$bitmapData = null;
                }
                node.$renderDirty = true;
                let p = node.$parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = node.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            delete BitmapData._displayList[hashCode];
        }
    }
}