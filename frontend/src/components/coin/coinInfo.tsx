import React from "react";

interface Props {
  title?: string;
  onClick?: () => void;
}

const CoinInfo: React.FC<Props> = ({ title, onClick }) => {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="col-span-1 h-auto max-h-[400px] place-items-center ">
        <img src="/assets/meme.jpeg" className="w-auto h-full" />
      </div>
      <div className=" lg:col-span-2 h-auto   ">
        <p>
          Prime Coin is a pioneering cryptocurrency tailored for people who
          embody strength, ambition, and unrelenting drive. Prime Coin is not
          just a digital asset—it’s a symbol of resilience and a rallying call
          for those who lead with purpose and embrace challenges head-on. At its
          core, Prime Coin operates with a mission to empower its community of
          holders by fostering strategic thinking and achieving dynamic returns.
          The tokenomics are designed to reward discipline and focus, offering
          benefits for long-term holding and meaningful participation in the
          Prime ecosystem. Prime Coin thrives on the principle of shared
          ambition and growth. It connects a global network of like-minded
          people who view success as a journey of striving and thriving. For
          those who believe in pushing boundaries, setting new standards, and
          standing resilient in the face of challenges, Prime Coin is more than
          just a cryptocurrency—it’s a movement. It represents strength in
          action and leadership in motion. This coin will rise to new heights...
          FIGURATIVELY and LITERALLY. Together, let’s make Prime the currency of
          the future.
        </p>
      </div>
    </div>
  );
};

export default CoinInfo;
