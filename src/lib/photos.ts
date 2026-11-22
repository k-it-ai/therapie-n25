import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/content';

import empfangFlur from '../assets/photos/empfang-flur.jpg';
import therapieraumErker from '../assets/photos/therapieraum-erker.jpg';
import empfangDetail from '../assets/photos/empfang-detail.jpg';
import wartebereich from '../assets/photos/wartebereich.jpg';
import empfang from '../assets/photos/empfang.jpg';
import therapieraumRot from '../assets/photos/therapieraum-rot.jpg';
import therapieraumHell from '../assets/photos/therapieraum-hell.jpg';
import therapieraumBunt from '../assets/photos/therapieraum-bunt.jpg';
import trainingsraum from '../assets/photos/trainingsraum.jpg';
import gyrotonic from '../assets/photos/gyrotonic.jpg';

type Photo = { src: ImageMetadata; alt: Record<Lang, string>; position?: string };

export const photos = {
  'empfang-flur': {
    src: empfangFlur,
    alt: { de: 'Heller Altbauflur mit Parkett und Blick in die Praxis', en: 'Bright period hallway with parquet leading into the practice' },
  },
  'therapieraum-erker': {
    src: therapieraumErker,
    alt: { de: 'Therapieraum mit Erkerfenstern und Behandlungsliege', en: 'Treatment room with bay windows and treatment table' },
    position: '50% 70%',
  },
  'empfang-detail': {
    src: empfangDetail,
    alt: { de: 'Empfangstresen mit Affenskulptur und Pflanze', en: 'Reception desk with monkey sculpture and plant' },
  },
  wartebereich: {
    src: wartebereich,
    alt: { de: 'Wartebereich mit Sesseln und Wellenbild', en: 'Waiting area with chairs and a wave photograph' },
  },
  empfang: {
    src: empfang,
    alt: { de: 'Empfang der Praxis mit Sesseln und hohem Fenster', en: 'Practice reception with armchairs and a tall window' },
  },
  'therapieraum-rot': {
    src: therapieraumRot,
    alt: { de: 'Therapieraum mit Liege unter einem orange-roten Gemälde', en: 'Treatment room with a table beneath an orange-red painting' },
    position: '50% 65%',
  },
  'therapieraum-hell': {
    src: therapieraumHell,
    alt: { de: 'Heller Therapieraum mit Liege vor großem Fenster', en: 'Bright treatment room with table in front of a large window' },
    position: '50% 62%',
  },
  'therapieraum-bunt': {
    src: therapieraumBunt,
    alt: { de: 'Therapieraum mit Liege und farbenfrohem Gemälde', en: 'Treatment room with table and a colourful painting' },
  },
  trainingsraum: {
    src: trainingsraum,
    alt: { de: 'Trainingsraum mit Gymnastikbällen, Sprossenwand und Gyrotonic-Gerät', en: 'Training room with exercise balls, wall bars and Gyrotonic machine' },
  },
  gyrotonic: {
    src: gyrotonic,
    alt: { de: 'Training am Gyrotonic-Gerät vor dem Fenster', en: 'Training on the Gyrotonic machine by the window' },
    position: '50% 55%',
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
