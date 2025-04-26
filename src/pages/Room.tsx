import { FormEvent, useEffect, useState } from 'react';
import { ID, Permission, Query, Role, type Models } from 'appwrite';
import client, { COLLECTION_ID_MESSAGES, DATABASE_ID, databases } from '../appwriteConfig';
import { Trash2 } from 'react-feather';
import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';

const Room = () => {
  const [messages, setMessages] = useState<Models.Document[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getMessages();
    const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        console.log('A MESSAGE WAS CREATED');
        setMessages((prevState) => [response.payload as Models.Document, ...prevState]);
      }

      if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
        console.log('A MESSAGE WAS DELETED!!!');
        setMessages((prevState) => prevState.filter((message) => message.$id !== (response.payload as Models.Document).$id));
      }
    });
    console.log('unsubscribe:', unsubscribe);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      body: messageBody,
      user_id: user?.$id,
      username: user?.name,
    };
    const permission = [Permission.write(Role.user(user!.$id))];
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, ID.unique(), payload, permission);
    console.log('Created', response);
    // setMessages((prevState) => [response, ...prevState]);
    setMessageBody('');
  };

  const getMessages = async () => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_MESSAGES, [Query.orderDesc('$createdAt'), Query.limit(100)]);
    setMessages(response.documents);
  };

  const deleteMessage = async (message_id: string) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, message_id);
    // setMessages((prevState) => prevState.filter((message) => message.$id !== message_id));
  };
  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form onSubmit={handleSubmit} id="message--form">
          <div>
            <textarea placeholder="Say something..." required maxLength={1000} onChange={(e) => setMessageBody(e.target.value)} value={messageBody}></textarea>
          </div>
          <div className="send-btn--wrapper">
            <input className="btn btn--secondary" type="submit" value="Send" />
          </div>
        </form>

        <div>
          {messages.map((message) => (
            <div key={message.$id} className="message--wrapper">
              <div className="message--header">
                <p>
                  {message.username ? <span>{message.username}</span> : <span>Anonymous user</span>}
                  <small className="message--timestamp">{new Date(message.$createdAt).toLocaleString()}</small>
                </p>
                {message.$permissions.includes(`delete("user:${user?.$id}")`) && <Trash2 className="delete--btn" onClick={() => deleteMessage(message.$id)} />}
              </div>
              <div className={'message--body' + (message.user_id === user!.$id ? ' message--body--owner' : '')}>
                <span>{message.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Room;
