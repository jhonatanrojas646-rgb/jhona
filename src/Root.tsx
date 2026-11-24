import React from "react";
import { Composition } from "remotion";
import { AlexShort } from "./videos/alejandro/Alex";
import { TOTAL, FPS } from "./videos/alejandro/story";
import { NureaShort } from "./videos/nurea/Nurea";
import { TOTAL as N_TOTAL, FPS as N_FPS } from "./videos/nurea/story";
import { Nurea2Short } from "./videos/nurea2/Nurea2";
import { TOTAL as N2_TOTAL, FPS as N2_FPS } from "./videos/nurea2/story";
// Registra cada short nuevo aquí, con su propio id.
export const Root: React.FC = () => (
  <>
    <Composition id="Alejandro" component={AlexShort} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="Nurea" component={NureaShort} durationInFrames={N_TOTAL} fps={N_FPS} width={1080} height={1920} />
    <Composition id="Nurea2" component={Nurea2Short} durationInFrames={N2_TOTAL} fps={N2_FPS} width={1080} height={1920} />
  </>
);
