use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;

#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u16(a: u16);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

#[wasm_bindgen]
pub struct Generator {
    width: u32,
    height: u32,
    data: Vec<u16>,
}
#[wasm_bindgen]
impl Generator {
    pub fn new(width: u32, height: u32) -> Generator {
        let size: usize = (width as usize) * (height as usize);

        Generator {
            width,
            height,
            data: vec![0; size],
        }
    }

    pub fn generate(&mut self, x_min: f64, x_max: f64, y_min: f64, y_max: f64, max_iterations: u16) {
        log("Generating...");
        let width = self.width as usize;
        let height = self.height as usize;
        let mut data = self.data.as_mut_slice();

        // The following implementation is based on C and avoids all fancy Rust types, such as Complex
        // to make it easier to understand.
        let mut x: f64;
        let mut y: f64;
        let mut x0: f64;
        let mut x2: f64;
        let mut y0: f64;
        let mut y2: f64;
        let mut iteration: u16;
        let mut xtemp: f64;
        let mut ytemp: f64;
        let mut index: usize;
        let x_diff = x_max - x_min;
        let y_diff = y_max - y_min;
        for i in 0..height {
            for j in 0..width {
                x = 0.0;
                y = 0.0;
                x2 = 0.0;
                y2 = 0.0;
                iteration = 0;
                x0 = x_min + x_diff * (j as f64) / (width as f64);
                y0 = y_min + y_diff * (i as f64) / (height as f64);
                while x2 + y2 < 4.0 && iteration < max_iterations {
                    xtemp = (x2 - y2 + x0).abs();
                    ytemp = (2.0 * x * y + y0).abs();
                    x = xtemp;
                    y = ytemp;
                    x2 = x * x;
                    y2 = y * y;
                    iteration += 1;
                }
                index = i * width + j;
                data[index] = iteration;
            }
        }

        log("Done");
    }

    pub fn data_ptr(&self) -> *const u16 {
        self.data.as_ptr()
    }

    pub fn data_len(&self) -> usize {
        self.data.len()
    }
}

