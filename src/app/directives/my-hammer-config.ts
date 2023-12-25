import { Injectable } from "@angular/core";
import { HammerGestureConfig } from "@angular/platform-browser";

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: { direction: (window as any).Hammer.DIRECTION_ALL },
  };
}