import dynamic from 'next/dynamic';
import { Step } from 'react-joyride';

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

export default Joyride;