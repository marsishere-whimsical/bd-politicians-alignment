import { Link } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Header({ activeTab, setActiveTab }: HeaderProps) {
  const getTabClasses = (tabName: string) => {
    const baseClasses = "inline-block p-4 border-b-2 rounded-t-lg cursor-pointer";
    return `${baseClasses} ${activeTab === tabName
      ? "text-white border-white"
      : "border-transparent text-neutral-500 hover:text-neutral-300 border-neutral-700 hover:border-neutral-300"
      }`;
  };

  return (
    <div className="text-neutral-400 border-b border-neutral-700 mb-4 select-none">
      <ul className="flex text-md font-medium text-center">
        <Link to="/game" onClick={() => setActiveTab('game')}>

          <li className={`me-2 ${getTabClasses('game')}`}>
            Sandwich Alignment Game

          </li>
        </Link>
        <Link to="/about" onClick={() => setActiveTab('about')}>

          <li className={`me-2 ${getTabClasses('about')}`}>
            About
          </li>
        </Link>

      </ul>
    </div>
  );
}

export default Header;