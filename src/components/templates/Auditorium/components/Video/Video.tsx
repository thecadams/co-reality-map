import React from "react";

import { IFRAME_ALLOW } from "settings";

export interface VideoProps {
  src?: string;
  overlayClassname: string;
  iframeClassname: string;
}

export const Video: React.FC<VideoProps> = ({
  src = "https://www.youtube.com/embed/x4Xt3P7FQ2M",
  overlayClassname,
  iframeClassname,
}) => {
  return (
    <div className={overlayClassname}>
      <iframe
        className={iframeClassname}
        src={src}
        title="Video"
        frameBorder="0"
        allow={IFRAME_ALLOW}
        allowFullScreen
      />
    </div>
  );
};