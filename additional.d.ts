import 'ol/layer/BaseTile';
import 'ol/Overlay';

// override Options, add name property to set layer name.
declare module 'ol/layer/BaseTile' {
  export interface Options {
    name?: string;
  }
}
