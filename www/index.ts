import init, { Generator } from "wasm_burning_ship";
import { debug } from "webpack";
import { iterationsToRainbowRGB } from "./utils/color";
import PanZoom from "panzoom";


interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface FractalConfig {
  iterationMax: number;
  bounds: Bounds;
}

init().then((wasm) => {
  const canvas = <HTMLCanvasElement>document.getElementById("fractal-canvas");
  const canvasContext = canvas.getContext("2d");
  sizeCanvasToWindow();

  // disable mouse wheel events
  window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });


  let panzoomInstance = PanZoom(canvas);
  
  panzoomInstance.on('panstart', function(e) {
    console.log('Fired when pan is just started ', e);
    // Note: e === instance.
  });
  
  panzoomInstance.on('pan', function(e) {
    console.log('Fired when the `element` is being panned', e);
  });
  
  panzoomInstance.on('panend', function(e) {
    console.log('Fired when pan ended', e);
  });
  
  panzoomInstance.on('zoom', function(e) {
    console.log('Fired when `element` is zoomed', e);
  });
  
  panzoomInstance.on('zoomend', function(e) {
    console.log('Fired when zoom animation ended', e);
  });
  
  panzoomInstance.on('transform', function(e) {
    // This event will be called along with events above.
    console.log('Fired when any transformation has happened', e);
  });

  const width = canvas.width;
  const height = canvas.height;
  const generator = Generator.new(width, height);

  let iterationMax = 50;
  let iterationMin = 0;

  // set bounds
  let bounds: Bounds = {
    xMin: -3,
    xMax: 0,
    yMin: -.5,
    yMax: 0.5,
  };
  let fractalConfig: FractalConfig = {
    iterationMax,
    bounds,
  };
  expandBoundsToMatchAspecRatio(bounds);
  iterate(fractalConfig);

  const rawIterationCounts = new Uint16Array(
    wasm.memory.buffer,
    generator.data_ptr(),
    generator.data_len()
  );

  paintArrayToCanvas(rawIterationCounts, canvasContext);

  function expandBoundsToMatchAspecRatio(bounds: Bounds) {
    const aspectRatio = width / height;
    const xRange = bounds.xMax - bounds.xMin;
    const yRange = bounds.yMax - bounds.yMin;
    const xRangeNew = yRange * aspectRatio;
    const xRangeDiff = xRangeNew - xRange;
    const xRangeHalf = xRangeDiff / 2;
    bounds.xMin -= xRangeHalf;
    bounds.xMax += xRangeHalf;
  }

  function iterate(config: FractalConfig) {
    const { iterationMax, bounds } = config;
    generator.generate(
      bounds.xMin,
      bounds.xMax,
      bounds.yMin,
      bounds.yMax,
      iterationMax
    );
  }

  function paintArrayToCanvas(
    array: Uint16Array,
    ctx: CanvasRenderingContext2D
  ) {
    if (array.length !== width * height) {
      throw new Error("Array size does not match canvas size");
    }

    const imageData = ctx.createImageData(width, height);
    convertRawIterationArrayToImageArray(array, imageData.data);

    ctx.putImageData(imageData, 0, 0);
  }

  function convertRawIterationArrayToImageArray(
    rawArray: Uint16Array,
    imageArray: Uint8ClampedArray,
    min?: number,
    max?: number
  ) {
    const minIteration = min || iterationMin;
    const maxIteration = max || iterationMax;

    for (let i = 0; i < rawArray.length; i++) {
      const iterations = rawArray[i];
      const color = iterationsToRainbowRGB(
        iterations,
        minIteration,
        maxIteration
      );
      const imageArrayIndex = i * 4;

      imageArray[imageArrayIndex] = color.r;
      imageArray[imageArrayIndex + 1] = color.g;
      imageArray[imageArrayIndex + 2] = color.b;
      imageArray[imageArrayIndex + 3] = 255;
    }
  }

  function sizeCanvasToWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
