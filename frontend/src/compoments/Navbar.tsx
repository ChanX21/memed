import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

interface DynamicComponent {
  bgColor: string;
  text: string;
}

const Navbar: React.FC = () => {

  const [component1, setComponent1] = useState<DynamicComponent>({
    bgColor: 'bg-gray-200',
    text: '[Address] bought or sold BNB amount of [Token]',
  });

  const [component2, setComponent2] = useState<DynamicComponent>({
    bgColor: 'bg-gray-200',
    text: '[Address] created [Token] on [Date]',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setComponent1({
        bgColor: getRandomColor(),
        text: `${randomAddress()} bought or sold ${randomAmount()} BNB of ${randomToken()}`,
      });
      setComponent2({
        bgColor: getRandomColor(),
        text: `${randomAddress()} created ${randomToken()} on ${randomDate()}`,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getRandomColor = (): string =>
    `bg-[${`#${Math.floor(Math.random() * 16777215).toString(16)}`}]`;

  const randomAddress = (): string =>
    `0x${Math.random().toString(36).substring(2, 10)}`;
  const randomToken = (): string => `Token-${Math.floor(Math.random() * 100)}`;
  const randomAmount = (): string => (Math.random() * 10).toFixed(2);
  const randomDate = (): string =>
    new Date(
      Date.now() - Math.floor(Math.random() * 10000000000)
    ).toLocaleDateString();

  return (
    <nav className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <div className="text-lg font-bold">Dynamic Navbar</div>
      <div className="flex space-x-4">
        <div
          className={`p-2 rounded-md text-sm text-black ${component1.bgColor}`}
        >
          {component1.text}
        </div>
        <div
          className={`p-2 rounded-md text-sm text-black ${component2.bgColor}`}
        >
          {component2.text}
        </div>
      </div>
    <ConnectButton />
    </nav>
  );
};

export default Navbar;
