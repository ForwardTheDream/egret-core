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

    /**
     * 创建一个canvas。
     */
    function createCanvas(width?: number, height?: number): HTMLCanvasElement {
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        if (!isNaN(width) && !isNaN(height)) {
            canvas.width = width;
            canvas.height = height;
        }
        return canvas;
    }

    /** refactor
     * Class used to describe the capabilities of the engine relatively to the current browser
     */
    export class EngineCapabilities {
        /** Maximum textures units per fragment shader */
        public maxTexturesImageUnits: number;
        /** Maximum texture units per vertex shader */
        public maxVertexTextureImageUnits: number;
        /** Maximum textures units in the entire pipeline */
        public maxCombinedTexturesImageUnits: number;
        /** Maximum texture size */
        public maxTextureSize: number;
        /** Maximum cube texture size */
        public maxCubemapTextureSize: number;
        /** Maximum render texture size */
        public maxRenderTextureSize: number;
        /** Maximum number of vertex attributes */
        public maxVertexAttribs: number;
        /** Maximum number of varyings */
        public maxVaryingVectors: number;
        /** Maximum number of uniforms per vertex shader */
        public maxVertexUniformVectors: number;
        /** Maximum number of uniforms per fragment shader */
        public maxFragmentUniformVectors: number;
        /** Defines if standard derivates (dx/dy) are supported */
        public standardDerivatives: boolean;
        /** Defines if s3tc texture compression is supported */
        public s3tc: Nullable<WEBGL_compressed_texture_s3tc>;
        /** Defines if pvrtc texture compression is supported */
        public pvrtc: any; //WEBGL_compressed_texture_pvrtc;
        /** Defines if etc1 texture compression is supported */
        public etc1: any; //WEBGL_compressed_texture_etc1;
        /** Defines if etc2 texture compression is supported */
        public etc2: any; //WEBGL_compressed_texture_etc;
        /** Defines if astc texture compression is supported */
        public astc: any; //WEBGL_compressed_texture_astc;
        /** Defines if float textures are supported */
        public textureFloat: boolean;
        /** Defines if vertex array objects are supported */
        public vertexArrayObject: boolean;
        /** Gets the webgl extension for anisotropic filtering (null if not supported) */
        public textureAnisotropicFilterExtension: Nullable<EXT_texture_filter_anisotropic>;
        /** Gets the maximum level of anisotropy supported */
        public maxAnisotropy: number;
        /** Defines if instancing is supported */
        public instancedArrays: boolean;
        /** Defines if 32 bits indices are supported */
        public uintIndices: boolean;
        /** Defines if high precision shaders are supported */
        public highPrecisionShaderSupported: boolean;
        /** Defines if depth reading in the fragment shader is supported */
        public fragmentDepthSupported: boolean;
        /** Defines if float texture linear filtering is supported*/
        public textureFloatLinearFiltering: boolean;
        /** Defines if rendering to float textures is supported */
        public textureFloatRender: boolean;
        /** Defines if half float textures are supported*/
        public textureHalfFloat: boolean;
        /** Defines if half float texture linear filtering is supported*/
        public textureHalfFloatLinearFiltering: boolean;
        /** Defines if rendering to half float textures is supported */
        public textureHalfFloatRender: boolean;
        /** Defines if textureLOD shader command is supported */
        public textureLOD: boolean;
        /** Defines if draw buffers extension is supported */
        public drawBuffersExtension: boolean;
        /** Defines if depth textures are supported */
        public depthTextureExtension: boolean;
        /** Defines if float color buffer are supported */
        public colorBufferFloat: boolean;
        /** Gets disjoint timer query extension (null if not supported) */
        //public timerQuery: EXT_disjoint_timer_query;
        /** Defines if timestamp can be used with timer query */
        //public canUseTimestampForTimerQuery: boolean;
        /** Defines if multiview is supported (https://www.khronos.org/registry/webgl/extensions/WEBGL_multiview/) */
        public multiview: any;
        /** Function used to let the system compiles shaders in background */
        public parallelShaderCompile: {
            COMPLETION_STATUS_KHR: number;
        };
    }






    /**
     * @private
     * WebGL上下文对象，提供简单的绘图接口
     * 抽象出此类，以实现共用一个context
     */
    export class WebGLRenderContext {

        public static antialias: boolean;

        /**
         * 渲染上下文
         */
        public context: WebGLRenderingContext;
        /**
         * 呈现最终绘图结果的画布
         */
        public surface: HTMLCanvasElement;

        /**
         * WebGLRenderContext单例
         */
        private static instance: WebGLRenderContext;
        public static getInstance(width: number, height: number): WebGLRenderContext {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new WebGLRenderContext(width, height);
            return this.instance;
        }

        public $maxTextureSize: number;

        /**
         * 顶点数组管理器
         */
        private vao: WebGLVertexArrayObject;

        /**
         * 绘制命令管理器
         */
        public drawCmdManager: WebGLDrawCmdManager;

        /**
         * render buffer 堆栈
         */
        public $bufferStack: WebGLRenderBuffer[];

        /**
         * 当前绑定的render buffer
         */
        private currentBuffer: WebGLRenderBuffer;

        /**
         * 推入一个RenderBuffer并绑定
         */
        public pushBuffer(buffer: WebGLRenderBuffer): void {

            this.$bufferStack.push(buffer);

            if (buffer != this.currentBuffer) {

                if (this.currentBuffer) {
                    // this.$drawWebGL();
                }

                this.drawCmdManager.pushActivateBuffer(buffer);
            }

            this.currentBuffer = buffer;

        }

        /**
         * 推出一个RenderBuffer并绑定上一个RenderBuffer
         */
        public popBuffer(): void {
            // 如果只剩下一个buffer，则不执行pop操作
            // 保证舞台buffer永远在最开始
            if (this.$bufferStack.length <= 1) {
                return;
            }

            let buffer = this.$bufferStack.pop();

            let lastBuffer = this.$bufferStack[this.$bufferStack.length - 1];

            // 重新绑定
            if (buffer != lastBuffer) {
                // this.$drawWebGL();

                this.drawCmdManager.pushActivateBuffer(lastBuffer);
            }

            this.currentBuffer = lastBuffer;
        }

        private bindIndices: boolean;
        /**
         * 启用RenderBuffer
         */
        private activateBuffer(buffer: WebGLRenderBuffer, width: number, height: number): void {

            buffer.rootRenderTarget.activate();

            if (!this.bindIndices) {
                this.uploadIndicesArray(this.vao.getIndices());
            }

            buffer.restoreStencil();

            buffer.restoreScissor();

            this.onResize(width, height);
        }

        /**
         * 上传顶点数据
         */
        private uploadVerticesArray(array: any): void {
            let gl: any = this.context;

            gl.bufferData(gl.ARRAY_BUFFER, array, gl.STREAM_DRAW);
            // gl.bufferSubData(gl.ARRAY_BUFFER, 0, array);
        }

        /**
         * 上传索引数据
         */
        private uploadIndicesArray(array: any): void {
            let gl: any = this.context;
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
            this.bindIndices = true;
        }

        private vertexBuffer;
        private indexBuffer;

        public constructor(width?: number, height?: number) {

            this.surface = createCanvas(width, height);

            if (egret.nativeRender) {
                return;
            }

            this.initWebGL();

            this.$bufferStack = [];

            let gl = this.context;
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            this.drawCmdManager = new WebGLDrawCmdManager();

            this.vao = new WebGLVertexArrayObject();

            this.setGlobalCompositeOperation("source-over");
        }

        /**
         * 销毁绘制对象
         */
        public destroy(): void {
            this.surface.width = this.surface.height = 0;
        }

        private onResize(width?: number, height?: number): void {
            width = width || this.surface.width;
            height = height || this.surface.height;
            this.projectionX = width / 2;
            this.projectionY = -height / 2;
            if (this.context) {
                this.context.viewport(0, 0, width, height);
            }
        }

        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param width 改变后的宽
         * @param height 改变后的高
         * @param useMaxSize 若传入true，则将改变后的尺寸与已有尺寸对比，保留较大的尺寸。
         */
        public resize(width: number, height: number, useMaxSize?: boolean): void {
            let surface = this.surface;
            if (useMaxSize) {
                if (surface.width < width) {
                    surface.width = width;
                }
                if (surface.height < height) {
                    surface.height = height;
                }
            }
            else {
                if (surface.width != width) {
                    surface.width = width;
                }
                if (surface.height != height) {
                    surface.height = height;
                }
            }

            this.onResize();
        }

        public static glContextId: number = 0;
        public glID: number = null;

        public projectionX: number = NaN;
        public projectionY: number = NaN;

        public contextLost: boolean = false;

        //refactor
        public _caps: EngineCapabilities;
        public _gl: WebGLRenderingContext;
        private readonly _webGLVersion: number = 1.0;
        // Hardware supported Compressed Textures
        private _texturesSupported = new Array<string>();
        /** @hidden */
        private _textureFormatInUse: Nullable<string>;


        private initWebGL(): void {
            this.onResize();

            this.surface.addEventListener("webglcontextlost", this.handleContextLost.bind(this), false);
            this.surface.addEventListener("webglcontextrestored", this.handleContextRestored.bind(this), false);

            this.getWebGLContext();

            let gl = this.context;
            this.$maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

            //
            this._initGLContext();
        }

        //refactor
        /**
     * Gets the list of texture formats supported
     */
        public get texturesSupported(): Array<string> {
            return this._texturesSupported;
        }

        /**
         * Gets the list of texture formats in use
         */
        public get textureFormatInUse(): Nullable<string> {
            return this._textureFormatInUse;
        }

        private _initGLContext(): void {

            // Caps
            this._gl = this.context;
            const availableExtensions = this._gl.getSupportedExtensions();
            if (DEBUG) {
                egret.log('availableExtensions = ' + availableExtensions);
            }
            this._caps = new EngineCapabilities();
            this._caps.maxTexturesImageUnits = this._gl.getParameter(this._gl.MAX_TEXTURE_IMAGE_UNITS);
            this._caps.maxCombinedTexturesImageUnits = this._gl.getParameter(this._gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            this._caps.maxVertexTextureImageUnits = this._gl.getParameter(this._gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            this._caps.maxTextureSize = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
            this._caps.maxCubemapTextureSize = this._gl.getParameter(this._gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            this._caps.maxRenderTextureSize = this._gl.getParameter(this._gl.MAX_RENDERBUFFER_SIZE);
            this._caps.maxVertexAttribs = this._gl.getParameter(this._gl.MAX_VERTEX_ATTRIBS);
            this._caps.maxVaryingVectors = this._gl.getParameter(this._gl.MAX_VARYING_VECTORS);
            this._caps.maxFragmentUniformVectors = this._gl.getParameter(this._gl.MAX_FRAGMENT_UNIFORM_VECTORS);
            this._caps.maxVertexUniformVectors = this._gl.getParameter(this._gl.MAX_VERTEX_UNIFORM_VECTORS);

            // Infos
            // this._glVersion = this._gl.getParameter(this._gl.VERSION);

            // var rendererInfo: any = this._gl.getExtension("WEBGL_debug_renderer_info");
            // if (rendererInfo != null) {
            //     this._glRenderer = this._gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);
            //     this._glVendor = this._gl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL);
            // }

            // if (!this._glVendor) {
            //     this._glVendor = "Unknown vendor";
            // }

            // if (!this._glRenderer) {
            //     this._glRenderer = "Unknown renderer";
            // }

            // // Constants
            // this._gl.HALF_FLOAT_OES = 0x8D61;   // Half floating-point type (16-bit).
            // if (this._gl.RGBA16F !== 0x881A) {
            //     this._gl.RGBA16F = 0x881A;      // RGBA 16-bit floating-point color-renderable internal sized format.
            // }
            // if (this._gl.RGBA32F !== 0x8814) {
            //     this._gl.RGBA32F = 0x8814;      // RGBA 32-bit floating-point color-renderable internal sized format.
            // }
            // if (this._gl.DEPTH24_STENCIL8 !== 35056) {
            //     this._gl.DEPTH24_STENCIL8 = 35056;
            // }

            // Extensions
            this._caps.standardDerivatives = this._webGLVersion > 1 || (this._gl.getExtension('OES_standard_derivatives') !== null);

            this._caps.astc = this._gl.getExtension('WEBGL_compressed_texture_astc') || this._gl.getExtension('WEBKIT_WEBGL_compressed_texture_astc');
            this._caps.s3tc = this._gl.getExtension('WEBGL_compressed_texture_s3tc') || this._gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
            this._caps.pvrtc = this._gl.getExtension('WEBGL_compressed_texture_pvrtc') || this._gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
            this._caps.etc1 = this._gl.getExtension('WEBGL_compressed_texture_etc1') || this._gl.getExtension('WEBKIT_WEBGL_compressed_texture_etc1');
            this._caps.etc2 = this._gl.getExtension('WEBGL_compressed_texture_etc') || this._gl.getExtension('WEBKIT_WEBGL_compressed_texture_etc') ||
                this._gl.getExtension('WEBGL_compressed_texture_es3_0'); // also a requirement of OpenGL ES 3

            this._caps.textureAnisotropicFilterExtension = this._gl.getExtension('EXT_texture_filter_anisotropic') || this._gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || this._gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
            this._caps.maxAnisotropy = this._caps.textureAnisotropicFilterExtension ? this._gl.getParameter(this._caps.textureAnisotropicFilterExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
            this._caps.uintIndices = this._webGLVersion > 1 || this._gl.getExtension('OES_element_index_uint') !== null;
            this._caps.fragmentDepthSupported = this._webGLVersion > 1 || this._gl.getExtension('EXT_frag_depth') !== null;
            this._caps.highPrecisionShaderSupported = false;
            // this._caps.timerQuery = this._gl.getExtension('EXT_disjoint_timer_query_webgl2') || this._gl.getExtension("EXT_disjoint_timer_query");
            // if (this._caps.timerQuery) {
            //     if (this._webGLVersion === 1) {
            //         this._gl.getQuery = (<any>this._caps.timerQuery).getQueryEXT.bind(this._caps.timerQuery);
            //     }
            //     this._caps.canUseTimestampForTimerQuery = this._gl.getQuery(this._caps.timerQuery.TIMESTAMP_EXT, this._caps.timerQuery.QUERY_COUNTER_BITS_EXT) > 0;
            // }

            // Checks if some of the format renders first to allow the use of webgl inspector.
            this._caps.colorBufferFloat = this._webGLVersion > 1 && this._gl.getExtension('EXT_color_buffer_float');

            this._caps.textureFloat = (this._webGLVersion > 1 || this._gl.getExtension('OES_texture_float')) ? true : false;
            this._caps.textureFloatLinearFiltering = this._caps.textureFloat && this._gl.getExtension('OES_texture_float_linear') ? true : false;
            //this._caps.textureFloatRender = this._caps.textureFloat && this._canRenderToFloatFramebuffer() ? true : false;

            this._caps.textureHalfFloat = (this._webGLVersion > 1 || this._gl.getExtension('OES_texture_half_float')) ? true : false;
            this._caps.textureHalfFloatLinearFiltering = (this._webGLVersion > 1 || (this._caps.textureHalfFloat && this._gl.getExtension('OES_texture_half_float_linear'))) ? true : false;
            // if (this._webGLVersion > 1) {
            //     this._gl.HALF_FLOAT_OES = 0x140B;
            // }
            //this._caps.textureHalfFloatRender = this._caps.textureHalfFloat && this._canRenderToHalfFloatFramebuffer();

            this._caps.textureLOD = (this._webGLVersion > 1 || this._gl.getExtension('EXT_shader_texture_lod')) ? true : false;

            this._caps.multiview = this._gl.getExtension('WEBGL_multiview');
            // Draw buffers
            // if (this._webGLVersion > 1) {
            //     this._caps.drawBuffersExtension = true;
            // } else {
            //     var drawBuffersExtension = this._gl.getExtension('WEBGL_draw_buffers');

            //     if (drawBuffersExtension !== null) {
            //         this._caps.drawBuffersExtension = true;
            //         this._gl.drawBuffers = drawBuffersExtension.drawBuffersWEBGL.bind(drawBuffersExtension);
            //         this._gl.DRAW_FRAMEBUFFER = this._gl.FRAMEBUFFER;

            //         for (var i = 0; i < 16; i++) {
            //             (<any>this._gl)["COLOR_ATTACHMENT" + i + "_WEBGL"] = (<any>drawBuffersExtension)["COLOR_ATTACHMENT" + i + "_WEBGL"];
            //         }
            //     } else {
            //         this._caps.drawBuffersExtension = false;
            //     }
            // }

            // Shader compiler threads
            this._caps.parallelShaderCompile = this._gl.getExtension('KHR_parallel_shader_compile');

            // Depth Texture
            // if (this._webGLVersion > 1) {
            //     this._caps.depthTextureExtension = true;
            // } else {
            //     var depthTextureExtension = this._gl.getExtension('WEBGL_depth_texture');

            //     if (depthTextureExtension != null) {
            //         this._caps.depthTextureExtension = true;
            //         this._gl.UNSIGNED_INT_24_8 = depthTextureExtension.UNSIGNED_INT_24_8_WEBGL;
            //     }
            // }

            // Vertex array object
            // if (this.disableVertexArrayObjects) {
            //     this._caps.vertexArrayObject = false;
            // } else if (this._webGLVersion > 1) {
            //     this._caps.vertexArrayObject = true;
            // } else {
            //     var vertexArrayObjectExtension = this._gl.getExtension('OES_vertex_array_object');

            //     if (vertexArrayObjectExtension != null) {
            //         this._caps.vertexArrayObject = true;
            //         this._gl.createVertexArray = vertexArrayObjectExtension.createVertexArrayOES.bind(vertexArrayObjectExtension);
            //         this._gl.bindVertexArray = vertexArrayObjectExtension.bindVertexArrayOES.bind(vertexArrayObjectExtension);
            //         this._gl.deleteVertexArray = vertexArrayObjectExtension.deleteVertexArrayOES.bind(vertexArrayObjectExtension);
            //     } else {
            //         this._caps.vertexArrayObject = false;
            //     }
            // }

            // Instances count
            // if (this._webGLVersion > 1) {
            //     this._caps.instancedArrays = true;
            // } else {
            //     var instanceExtension = <ANGLE_instanced_arrays>this._gl.getExtension('ANGLE_instanced_arrays');

            //     if (instanceExtension != null) {
            //         this._caps.instancedArrays = true;
            //         this._gl.drawArraysInstanced = instanceExtension.drawArraysInstancedANGLE.bind(instanceExtension);
            //         this._gl.drawElementsInstanced = instanceExtension.drawElementsInstancedANGLE.bind(instanceExtension);
            //         this._gl.vertexAttribDivisor = instanceExtension.vertexAttribDivisorANGLE.bind(instanceExtension);
            //     } else {
            //         this._caps.instancedArrays = false;
            //     }
            // }

            // Intelligently add supported compressed formats in order to check for.
            // Check for ASTC support first as it is most powerful and to be very cross platform.
            // Next PVRTC & DXT, which are probably superior to ETC1/2.
            // Likely no hardware which supports both PVR & DXT, so order matters little.
            // ETC2 is newer and handles ETC1 (no alpha capability), so check for first.
            if (this._caps.astc) { this.texturesSupported.push('-astc.ktx'); }
            if (this._caps.s3tc) { this.texturesSupported.push('-dxt.ktx'); }
            if (this._caps.pvrtc) { this.texturesSupported.push('-pvrtc.ktx'); }
            if (this._caps.etc2) { this.texturesSupported.push('-etc2.ktx'); }
            if (this._caps.etc1) { this.texturesSupported.push('-etc1.ktx'); }

            if (this._gl.getShaderPrecisionFormat) {
                var vertex_highp = this._gl.getShaderPrecisionFormat(this._gl.VERTEX_SHADER, this._gl.HIGH_FLOAT);
                var fragment_highp = this._gl.getShaderPrecisionFormat(this._gl.FRAGMENT_SHADER, this._gl.HIGH_FLOAT);

                if (vertex_highp && fragment_highp) {
                    this._caps.highPrecisionShaderSupported = vertex_highp.precision !== 0 && fragment_highp.precision !== 0;
                }
            }

            // Depth buffer
            // this.setDepthBuffer(true);
            // this.setDepthFunctionToLessOrEqual();
            // this.setDepthWrite(true);

            // // Texture maps
            // this._maxSimultaneousTextures = this._caps.maxCombinedTexturesImageUnits;
            // for (let slot = 0; slot < this._maxSimultaneousTextures; slot++) {
            //     this._nextFreeTextureSlots.push(slot);
            // }
        }


        /**
        * Set the compressed texture format to use, based on the formats you have, and the formats
        * supported by the hardware / browser.
        *
        * Khronos Texture Container (.ktx) files are used to support this. This format has the
        * advantage of being specifically designed for OpenGL. Header elements directly correspond
        * to API arguments needed to compressed textures. This puts the burden on the container
        * generator to house the arcane code for determining these for current & future formats.
        *
        * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
        * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
        *
        * Note: The result of this call is not taken into account when a texture is base64.
        *
        * @param formatsAvailable defines the list of those format families you have created
        * on your server. Syntax: '-' + format family + '.ktx'. (Case and order do not matter.)
        *
        * Current families are astc, dxt, pvrtc, etc2, & etc1.
        * @returns The extension selected.
        */
       /*
        public setTextureFormatToUse(formatsAvailable: Array<string>): Nullable<string> {
            for (var i = 0, len1 = this.texturesSupported.length; i < len1; i++) {
                for (var j = 0, len2 = formatsAvailable.length; j < len2; j++) {
                    if (this._texturesSupported[i] === formatsAvailable[j].toLowerCase()) {
                        return this._textureFormatInUse = this._texturesSupported[i];
                    }
                }
            }
            // actively set format to nothing, to allow this to be called more than once
            // and possibly fail the 2nd time
            this._textureFormatInUse = null;
            return null;
        }
        */

        private handleContextLost() {
            this.contextLost = true;
        }

        private handleContextRestored() {
            this.initWebGL();
            this.contextLost = false;
        }

        private getWebGLContext() {
            let options = {
                antialias: WebGLRenderContext.antialias,
                stencil: true//设置可以使用模板（用于不规则遮罩）
            };
            let gl: any;
            //todo 是否使用chrome源码names
            //let contextNames = ["moz-webgl", "webkit-3d", "experimental-webgl", "webgl", "3d"];
            let names = ["webgl", "experimental-webgl"];
            for (let i = 0; i < names.length; i++) {
                try {
                    gl = this.surface.getContext(names[i], options);
                } catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                $error(1021);
            }
            this.setContext(gl);
        }

        private setContext(gl: any) {
            this.context = gl;
            gl.id = WebGLRenderContext.glContextId++;
            this.glID = gl.id;

            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);
            gl.colorMask(true, true, true, true);

            // 目前只使用0号材质单元，默认开启
            gl.activeTexture(gl.TEXTURE0);
        }

        /**
         * 开启模版检测
         */
        public enableStencilTest(): void {
            let gl: any = this.context;
            gl.enable(gl.STENCIL_TEST);
        }

        /**
         * 关闭模版检测
         */
        public disableStencilTest(): void {
            let gl: any = this.context;
            gl.disable(gl.STENCIL_TEST);
        }

        /**
         * 开启scissor检测
         */
        public enableScissorTest(rect: egret.Rectangle): void {
            let gl: any = this.context;
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(rect.x, rect.y, rect.width, rect.height);
        }

        /**
         * 关闭scissor检测
         */
        public disableScissorTest(): void {
            let gl: any = this.context;
            gl.disable(gl.SCISSOR_TEST);
        }

        /**
         * 获取像素信息
         */
        public getPixels(x, y, width, height, pixels): void {
            let gl: any = this.context;
            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        }

        /**
         * 创建一个WebGLTexture
         */
        public createTexture(bitmapData: BitmapData): WebGLTexture {
            let gl: any = this.context;

            let texture = gl.createTexture();

            if (!texture) {
                //先创建texture失败,然后lost事件才发出来..
                this.contextLost = true;
                return;
            }

            texture.glContext = gl;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            return texture;
        }

        private createTextureFromCompressedData(data, width, height, levels, internalFormat): WebGLTexture {
            return null;
        }

        /**
         * 更新材质的bitmapData
         */
        public updateTexture(texture: WebGLTexture, bitmapData: BitmapData): void {
            let gl: any = this.context;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
        }

        /**
         * 获取一个WebGLTexture
         * 如果有缓存的texture返回缓存的texture，如果没有则创建并缓存texture
         */
        public getWebGLTexture(bitmapData: BitmapData): WebGLTexture {
            if (!bitmapData.webGLTexture) {
                if (bitmapData.format == "image") {
                    bitmapData.webGLTexture = this.createTexture(bitmapData.source);
                }
                else if (bitmapData.format == "pvr") {//todo 需要支持其他格式
                    bitmapData.webGLTexture = this.createTextureFromCompressedData(bitmapData.source.pvrtcData, bitmapData.width, bitmapData.height, bitmapData.source.mipmapsCount, bitmapData.source.format);
                }
                if (bitmapData.$deleteSource && bitmapData.webGLTexture) {
                    bitmapData.source = null;
                }
                if (bitmapData.webGLTexture) {
                    //todo 默认值
                    bitmapData.webGLTexture["smoothing"] = true;
                }
            }
            return bitmapData.webGLTexture;
        }

        /**
         * 清除矩形区域
         */
        public clearRect(x: number, y: number, width: number, height: number): void {
            if (x != 0 || y != 0 || width != this.surface.width || height != this.surface.height) {
                let buffer = this.currentBuffer;
                if (buffer.$hasScissor) {
                    this.setGlobalCompositeOperation("destination-out");
                    this.drawRect(x, y, width, height);
                    this.setGlobalCompositeOperation("source-over");
                } else {
                    let m = buffer.globalMatrix;
                    if (m.b == 0 && m.c == 0) {
                        x = x * m.a + m.tx;
                        y = y * m.d + m.ty;
                        width = width * m.a;
                        height = height * m.d;
                        this.enableScissor(x, - y - height + buffer.height, width, height);
                        this.clear();
                        this.disableScissor();
                    } else {
                        this.setGlobalCompositeOperation("destination-out");
                        this.drawRect(x, y, width, height);
                        this.setGlobalCompositeOperation("source-over");
                    }
                }
            } else {
                this.clear();
            }
        }

        /**
         * 设置混色
         */
        public setGlobalCompositeOperation(value: string) {
            this.drawCmdManager.pushSetBlend(value);
        }

        /**
         * 绘制图片，image参数可以是BitmapData或者renderTarget
         */
        public drawImage(image: BitmapData,
            sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number,
            destX: number, destY: number, destWidth: number, destHeight: number,
            imageSourceWidth: number, imageSourceHeight: number, rotated: boolean, smoothing?: boolean): void {
            let buffer = this.currentBuffer;
            if (this.contextLost || !image || !buffer) {
                return;
            }

            let texture: WebGLTexture;
            let offsetX;
            let offsetY;
            if (image["texture"] || (image.source && image.source["texture"])) {
                // 如果是render target
                texture = image["texture"] || image.source["texture"];
                buffer.saveTransform();
                offsetX = buffer.$offsetX;
                offsetY = buffer.$offsetY;
                buffer.useOffset();
                buffer.transform(1, 0, 0, -1, 0, destHeight + destY * 2);// 翻转
            } else if (!image.source && !image.webGLTexture) {
                return;
            } else {
                texture = this.getWebGLTexture(image);
            }

            if (!texture) {
                return;
            }

            this.drawTexture(texture,
                sourceX, sourceY, sourceWidth, sourceHeight,
                destX, destY, destWidth, destHeight,
                imageSourceWidth, imageSourceHeight,
                undefined, undefined, undefined, undefined, rotated, smoothing);

            if (image.source && image.source["texture"]) {
                buffer.$offsetX = offsetX;
                buffer.$offsetY = offsetY;
                buffer.restoreTransform();
            }
        }

        /**
         * 绘制Mesh
         */
        public drawMesh(image: BitmapData,
            sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number,
            destX: number, destY: number, destWidth: number, destHeight: number,
            imageSourceWidth: number, imageSourceHeight: number,
            meshUVs: number[], meshVertices: number[], meshIndices: number[], bounds: Rectangle, rotated: boolean, smoothing: boolean
        ): void {
            let buffer = this.currentBuffer;
            if (this.contextLost || !image || !buffer) {
                return;
            }

            let texture: WebGLTexture;
            let offsetX;
            let offsetY;
            if (image["texture"] || (image.source && image.source["texture"])) {
                // 如果是render target
                texture = image["texture"] || image.source["texture"];
                buffer.saveTransform();
                offsetX = buffer.$offsetX;
                offsetY = buffer.$offsetY;
                buffer.useOffset();
                buffer.transform(1, 0, 0, -1, 0, destHeight + destY * 2);// 翻转
            } else if (!image.source && !image.webGLTexture) {
                return;
            } else {
                texture = this.getWebGLTexture(image);
            }

            if (!texture) {
                return;
            }

            this.drawTexture(texture,
                sourceX, sourceY, sourceWidth, sourceHeight,
                destX, destY, destWidth, destHeight,
                imageSourceWidth, imageSourceHeight, meshUVs, meshVertices, meshIndices, bounds, rotated, smoothing);

            if (image["texture"] || (image.source && image.source["texture"])) {
                buffer.$offsetX = offsetX;
                buffer.$offsetY = offsetY;
                buffer.restoreTransform();
            }
        }

        /**
         * 绘制材质
         */
        public drawTexture(texture: WebGLTexture,
            sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number,
            destX: number, destY: number, destWidth: number, destHeight: number, textureWidth: number, textureHeight: number,
            meshUVs?: number[], meshVertices?: number[], meshIndices?: number[], bounds?: Rectangle, rotated?: boolean, smoothing?: boolean): void {
            let buffer = this.currentBuffer;
            if (this.contextLost || !texture || !buffer) {
                return;
            }

            if (meshVertices && meshIndices) {
                if (this.vao.reachMaxSize(meshVertices.length / 2, meshIndices.length)) {
                    this.$drawWebGL();
                }
            } else {
                if (this.vao.reachMaxSize()) {
                    this.$drawWebGL();
                }
            }

            if (smoothing != undefined && texture["smoothing"] != smoothing) {
                this.drawCmdManager.pushChangeSmoothing(texture, smoothing);
            }

            if (meshUVs) {
                this.vao.changeToMeshIndices();
            }

            let count = meshIndices ? meshIndices.length / 3 : 2;
            // 应用$filter，因为只可能是colorMatrixFilter，最后两个参数可不传
            this.drawCmdManager.pushDrawTexture(texture, count, this.$filter, textureWidth, textureHeight);

            this.vao.cacheArrays(buffer, sourceX, sourceY, sourceWidth, sourceHeight,
                destX, destY, destWidth, destHeight, textureWidth, textureHeight,
                meshUVs, meshVertices, meshIndices, rotated);
        }

        /**
         * 绘制矩形（仅用于遮罩擦除等）
         */
        public drawRect(x: number, y: number, width: number, height: number): void {
            let buffer = this.currentBuffer;
            if (this.contextLost || !buffer) {
                return;
            }

            if (this.vao.reachMaxSize()) {
                this.$drawWebGL();
            }

            this.drawCmdManager.pushDrawRect();

            this.vao.cacheArrays(buffer, 0, 0, width, height, x, y, width, height, width, height);
        }

        /**
         * 绘制遮罩
         */
        public pushMask(x: number, y: number, width: number, height: number): void {
            let buffer = this.currentBuffer;
            if (this.contextLost || !buffer) {
                return;
            }
            buffer.$stencilList.push({ x, y, width, height });
            if (this.vao.reachMaxSize()) {
                this.$drawWebGL();
            }
            this.drawCmdManager.pushPushMask();
            this.vao.cacheArrays(buffer, 0, 0, width, height, x, y, width, height, width, height);
        }

        /**
         * 恢复遮罩
         */
        public popMask(): void {
            let buffer = this.currentBuffer;
            if (this.contextLost || !buffer) {
                return;
            }

            let mask = buffer.$stencilList.pop();

            if (this.vao.reachMaxSize()) {
                this.$drawWebGL();
            }
            this.drawCmdManager.pushPopMask();
            this.vao.cacheArrays(buffer, 0, 0, mask.width, mask.height, mask.x, mask.y, mask.width, mask.height, mask.width, mask.height);
        }

        /**
         * 清除颜色缓存
         */
        public clear(): void {
            this.drawCmdManager.pushClearColor();
        }

        public $scissorState: boolean = false;
        /**
         * 开启scissor test
         */
        public enableScissor(x: number, y: number, width: number, height: number): void {
            let buffer = this.currentBuffer;
            this.drawCmdManager.pushEnableScissor(x, y, width, height);
            buffer.$hasScissor = true;
        }

        /**
         * 关闭scissor test
         */
        public disableScissor(): void {
            let buffer = this.currentBuffer;
            this.drawCmdManager.pushDisableScissor();
            buffer.$hasScissor = false;
        }

        /**
         * 执行目前缓存在命令列表里的命令并清空
         */
        public activatedBuffer: WebGLRenderBuffer;
        public $drawWebGL() {
            if (this.drawCmdManager.drawDataLen == 0 || this.contextLost) {
                return;
            }

            this.uploadVerticesArray(this.vao.getVertices());

            // 有mesh，则使用indicesForMesh
            if (this.vao.isMesh()) {
                this.uploadIndicesArray(this.vao.getMeshIndices());
            }

            let length = this.drawCmdManager.drawDataLen;
            let offset = 0;
            for (let i = 0; i < length; i++) {
                let data = this.drawCmdManager.drawData[i];
                offset = this.drawData(data, offset);
                // 计算draw call
                if (data.type == DRAWABLE_TYPE.ACT_BUFFER) {
                    this.activatedBuffer = data.buffer;
                }
                if (data.type == DRAWABLE_TYPE.TEXTURE || data.type == DRAWABLE_TYPE.RECT || data.type == DRAWABLE_TYPE.PUSH_MASK || data.type == DRAWABLE_TYPE.POP_MASK) {
                    if (this.activatedBuffer && this.activatedBuffer.$computeDrawCall) {
                        this.activatedBuffer.$drawCalls++;
                    }
                }
            }

            // 切换回默认indices
            if (this.vao.isMesh()) {
                this.uploadIndicesArray(this.vao.getIndices());
            }

            // 清空数据
            this.drawCmdManager.clear();
            this.vao.clear();
        }

        /**
         * 执行绘制命令
         */
        private drawData(data: any, offset: number) {
            if (!data) {
                return;
            }

            let gl = this.context;
            let program: EgretWebGLProgram;
            let filter = data.filter;

            switch (data.type) {
                case DRAWABLE_TYPE.TEXTURE:
                    if (filter) {
                        if (filter.type === "custom") {
                            program = EgretWebGLProgram.getProgram(gl, filter.$vertexSrc, filter.$fragmentSrc, filter.$shaderKey);
                        } else if (filter.type === "colorTransform") {
                            program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.colorTransform_frag, "colorTransform");
                        } else if (filter.type === "blurX") {
                            program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.blur_frag, "blur");
                        } else if (filter.type === "blurY") {
                            program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.blur_frag, "blur");
                        } else if (filter.type === "glow") {
                            program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.glow_frag, "glow");
                        }
                    } else {
                        program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.texture_frag, "texture");
                    }

                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);

                    offset += this.drawTextureElements(data, offset);
                    break;
                case DRAWABLE_TYPE.RECT:

                    program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.primitive_frag, "primitive");
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);

                    offset += this.drawRectElements(data, offset);
                    break;
                case DRAWABLE_TYPE.PUSH_MASK:

                    program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.primitive_frag, "primitive");
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);

                    offset += this.drawPushMaskElements(data, offset);
                    break;
                case DRAWABLE_TYPE.POP_MASK:

                    program = EgretWebGLProgram.getProgram(gl, EgretShaderLib.default_vert, EgretShaderLib.primitive_frag, "primitive");
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);

                    offset += this.drawPopMaskElements(data, offset);
                    break;
                case DRAWABLE_TYPE.BLEND:
                    this.setBlendMode(data.value);
                    break;
                case DRAWABLE_TYPE.RESIZE_TARGET:
                    data.buffer.rootRenderTarget.resize(data.width, data.height);
                    this.onResize(data.width, data.height);
                    break;
                case DRAWABLE_TYPE.CLEAR_COLOR:
                    if (this.activatedBuffer) {
                        let target = this.activatedBuffer.rootRenderTarget;
                        if (target.width != 0 || target.height != 0) {
                            target.clear(true);
                        }
                    }
                    break;
                case DRAWABLE_TYPE.ACT_BUFFER:
                    this.activateBuffer(data.buffer, data.width, data.height);
                    break;
                case DRAWABLE_TYPE.ENABLE_SCISSOR:
                    let buffer = this.activatedBuffer;
                    if (buffer) {
                        if (buffer.rootRenderTarget) {
                            buffer.rootRenderTarget.enabledStencil();
                        }
                        buffer.enableScissor(data.x, data.y, data.width, data.height);
                    }
                    break;
                case DRAWABLE_TYPE.DISABLE_SCISSOR:
                    buffer = this.activatedBuffer;
                    if (buffer) {
                        buffer.disableScissor();
                    }
                    break;
                case DRAWABLE_TYPE.SMOOTHING:
                    gl.bindTexture(gl.TEXTURE_2D, data.texture);
                    if (data.smoothing) {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }
                    else {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    }
                    break;
                default:
                    break;
            }

            return offset;
        }

        public currentProgram: EgretWebGLProgram;
        private activeProgram(gl: WebGLRenderingContext, program: EgretWebGLProgram): void {
            if (program != this.currentProgram) {
                gl.useProgram(program.id);

                // 目前所有attribute buffer的绑定方法都是一致的
                let attribute = program.attributes;

                for (let key in attribute) {
                    if (key === "aVertexPosition") {
                        gl.vertexAttribPointer(attribute["aVertexPosition"].location, 2, gl.FLOAT, false, 5 * 4, 0);
                        gl.enableVertexAttribArray(attribute["aVertexPosition"].location);
                    } else if (key === "aTextureCoord") {
                        gl.vertexAttribPointer(attribute["aTextureCoord"].location, 2, gl.FLOAT, false, 5 * 4, 2 * 4);
                        gl.enableVertexAttribArray(attribute["aTextureCoord"].location);
                    } else if (key === "aColor") {
                        gl.vertexAttribPointer(attribute["aColor"].location, 1, gl.FLOAT, false, 5 * 4, 4 * 4);
                        gl.enableVertexAttribArray(attribute["aColor"].location);
                    }
                }

                this.currentProgram = program;
            }
        }

        private syncUniforms(program: EgretWebGLProgram, filter: Filter, textureWidth: number, textureHeight: number): void {
            let uniforms = program.uniforms;
            let isCustomFilter: boolean = filter && filter.type === "custom";
            for (let key in uniforms) {
                if (key === "projectionVector") {
                    uniforms[key].setValue({ x: this.projectionX, y: this.projectionY });
                } else if (key === "uTextureSize") {
                    uniforms[key].setValue({ x: textureWidth, y: textureHeight });
                } else if (key === "uSampler") {

                } else {
                    let value = filter.$uniforms[key];
                    if (value !== undefined) {
                        uniforms[key].setValue(value);
                    } else {
                        // egret.warn("filter custom: uniform " + key + " not defined!");
                    }
                }
            }
        }

        /**
         * 画texture
         **/
        private drawTextureElements(data: any, offset: number): number {
            let gl: any = this.context;
            gl.bindTexture(gl.TEXTURE_2D, data.texture);
            let size = data.count * 3;
            gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
            return size;
        }

        /**
         * @private
         * 画rect
         **/
        private drawRectElements(data: any, offset: number): number {
            let gl: any = this.context;
            // gl.bindTexture(gl.TEXTURE_2D, null);
            let size = data.count * 3;
            gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
            return size;
        }

        /**
         * 画push mask
         **/
        private drawPushMaskElements(data: any, offset: number): number {
            let gl: any = this.context;

            let size = data.count * 3;

            let buffer = this.activatedBuffer;
            if (buffer) {
                if (buffer.rootRenderTarget) {
                    buffer.rootRenderTarget.enabledStencil();
                }
                if (buffer.stencilHandleCount == 0) {
                    buffer.enableStencil();
                    gl.clear(gl.STENCIL_BUFFER_BIT);// clear
                }

                let level = buffer.stencilHandleCount;
                buffer.stencilHandleCount++;

                gl.colorMask(false, false, false, false);
                gl.stencilFunc(gl.EQUAL, level, 0xFF);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

                // gl.bindTexture(gl.TEXTURE_2D, null);
                gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);

                gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                gl.colorMask(true, true, true, true);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            }

            return size;
        }

        /**
         * 画pop mask
         **/
        private drawPopMaskElements(data: any, offset: number) {
            let gl: any = this.context;

            let size = data.count * 3;

            let buffer = this.activatedBuffer;
            if (buffer) {
                buffer.stencilHandleCount--;

                if (buffer.stencilHandleCount == 0) {
                    buffer.disableStencil();// skip this draw
                } else {
                    let level = buffer.stencilHandleCount;
                    gl.colorMask(false, false, false, false);
                    gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

                    // gl.bindTexture(gl.TEXTURE_2D, null);
                    gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);

                    gl.stencilFunc(gl.EQUAL, level, 0xFF);
                    gl.colorMask(true, true, true, true);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                }
            }

            return size;
        }

        private vertSize: number = 5;

        /**
         * 设置混色
         */
        private setBlendMode(value: string): void {
            let gl: any = this.context;
            let blendModeWebGL = WebGLRenderContext.blendModesForGL[value];
            if (blendModeWebGL) {
                gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
            }
        }

        // 记录一个colorTransformFilter
        // 这是一个优化，实现物体在只有一个变色滤镜的情况下，以最简单方式渲染
        // 在$filter有值的情况下，drawImage要注意应用此filter
        public $filter: ColorMatrixFilter;

        /**
         * 应用滤镜绘制给定的render target
         * 此方法不会导致input被释放，所以如果需要释放input，需要调用此方法后手动调用release
         */
        public drawTargetWidthFilters(filters: Filter[], input: WebGLRenderBuffer): void {
            let originInput = input,
                filtersLen: number = filters.length,
                output: WebGLRenderBuffer;

            // 应用前面的滤镜
            if (filtersLen > 1) {
                for (let i = 0; i < filtersLen - 1; i++) {
                    let filter = filters[i];
                    let width: number = input.rootRenderTarget.width;
                    let height: number = input.rootRenderTarget.height;
                    output = WebGLRenderBuffer.create(width, height);
                    output.setTransform(1, 0, 0, 1, 0, 0);
                    output.globalAlpha = 1;
                    this.drawToRenderTarget(filter, input, output);
                    if (input != originInput) {
                        WebGLRenderBuffer.release(input);
                    }
                    input = output;
                }
            }

            // 应用最后一个滤镜并绘制到当前场景中
            let filter = filters[filtersLen - 1];
            this.drawToRenderTarget(filter, input, this.currentBuffer);

            // 释放掉用于交换的buffer
            if (input != originInput) {
                WebGLRenderBuffer.release(input);
            }
        }

        /**
         * 向一个renderTarget中绘制
         * */
        private drawToRenderTarget(filter: Filter, input: WebGLRenderBuffer, output: WebGLRenderBuffer): void {
            if (this.contextLost) {
                return;
            }

            if (this.vao.reachMaxSize()) {
                this.$drawWebGL();
            }

            this.pushBuffer(output);

            let originInput = input,
                temp: WebGLRenderBuffer,
                width: number = input.rootRenderTarget.width,
                height: number = input.rootRenderTarget.height;

            // 模糊滤镜分别处理blurX与blurY
            if (filter.type == "blur") {
                let blurXFilter = (<BlurFilter>filter).blurXFilter;
                let blurYFilter = (<BlurFilter>filter).blurYFilter;

                if (blurXFilter.blurX != 0 && blurYFilter.blurY != 0) {
                    temp = WebGLRenderBuffer.create(width, height);
                    temp.setTransform(1, 0, 0, 1, 0, 0);
                    temp.globalAlpha = 1;
                    this.drawToRenderTarget((<BlurFilter>filter).blurXFilter, input, temp);
                    if (input != originInput) {
                        WebGLRenderBuffer.release(input);
                    }
                    input = temp;

                    filter = blurYFilter;
                } else {
                    filter = blurXFilter.blurX === 0 ? blurYFilter : blurXFilter;
                }
            }

            // 绘制input结果到舞台
            output.saveTransform();
            output.transform(1, 0, 0, -1, 0, height);
            this.vao.cacheArrays(output, 0, 0, width, height, 0, 0, width, height, width, height);
            output.restoreTransform();

            this.drawCmdManager.pushDrawTexture(input.rootRenderTarget.texture, 2, filter, width, height);

            // 释放掉input
            if (input != originInput) {
                WebGLRenderBuffer.release(input);
            }

            this.popBuffer();
        }

        public static blendModesForGL: any = null;

        public static initBlendMode(): void {
            WebGLRenderContext.blendModesForGL = {};
            WebGLRenderContext.blendModesForGL["source-over"] = [1, 771];
            WebGLRenderContext.blendModesForGL["lighter"] = [1, 1];
            WebGLRenderContext.blendModesForGL["lighter-in"] = [770, 771];
            WebGLRenderContext.blendModesForGL["destination-out"] = [0, 771];
            WebGLRenderContext.blendModesForGL["destination-in"] = [0, 770];
        }
    }

    WebGLRenderContext.initBlendMode();

}
