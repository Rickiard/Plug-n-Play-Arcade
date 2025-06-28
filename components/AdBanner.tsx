import React, { useEffect } from 'react';

// Replace 'ca-pub-XXXXXXXXXXXXXXXX' and 'XXXXXXXXXX' with your AdSense publisher and ad slot IDs
const AdBanner: React.FC = () => {
  useEffect(() => {
    if (window && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch (e) {}
    }
  }, []);
  return (
    <div className="flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: 320, height: 100 }}
        data-ad-client="ca-pub-9475855115164704"
        data-ad-slot="7704242516"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
