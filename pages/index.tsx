import { Chat } from '../components/Chat';
import styles from '../styles/chat.module.css';

export default function Home() {
  return (
    <div className={styles.container}>

      <Chat />

    </div>
  );
}
