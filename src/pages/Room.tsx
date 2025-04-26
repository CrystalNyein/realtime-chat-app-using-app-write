import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ID, Permission, Query, Role, type Models } from 'appwrite';
import client, { COLLECTION_ID_MESSAGES, DATABASE_ID, databases } from '../appwriteConfig';
import { Edit2, Save, Trash2, X } from 'react-feather';
import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';

const Room = () => {
  const initialEditMessageBody = { id: '', value: '' };
  const [messages, setMessages] = useState<Models.Document[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [editMessageBody, setEditMessageBody] = useState(initialEditMessageBody);

  const { user } = useAuth();

  useEffect(() => {
    getMessages();
    const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        console.log('A MESSAGE WAS CREATED');
        setMessages((prevState) => [response.payload as Models.Document, ...prevState]);
      }

      if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        console.log('A MESSAGE WAS UPDATED!!!');
        setMessages((prevState) => prevState.map((message) => (message.$id !== (response.payload as Models.Document).$id ? message : (response.payload as Models.Document))));
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
  const updateMessage = async () => {
    const payload = {
      body: editMessageBody.value,
    };
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, editMessageBody.id, payload);
    setEditMessageBody(initialEditMessageBody);
  };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setEditMessageBody({ ...editMessageBody, [name]: value });
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
            <div key={message.$id} className={'message--wrapper' + (message.user_id === user!.$id ? ' message--owner' : '')}>
              <div className="message--header">
                <p>
                  {message.username ? <span>{message.username}</span> : <span>Anonymous user</span>}
                  <small className="message--timestamp">{new Date(message.$createdAt).toLocaleString()}</small>
                  {message.$createdAt != message.$updatedAt && <small> Edited</small>}
                </p>
                {message.$permissions.includes(`delete("user:${user?.$id}")`) && (
                  <div className="icon--wrapper">
                    {editMessageBody.id == message.$id ? (
                      <>
                        <Save className="edit--btn" onClick={updateMessage} />
                        <X className="delete--btn" onClick={() => setEditMessageBody(initialEditMessageBody)} />
                      </>
                    ) : (
                      <>
                        <Edit2 className="edit--btn" onClick={() => setEditMessageBody({ id: message.$id, value: message.body })} />
                        <Trash2 className="delete--btn" onClick={() => deleteMessage(message.$id)} />
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className={'message--body' + (message.user_id === user!.$id ? ' message--body--owner' + (editMessageBody.id == message.$id ? ' message--body--edit' : '') : '')}>
                {editMessageBody.id == message.$id ? (
                  <input type="text" className="edit--input" value={editMessageBody.value} name="value" onChange={handleInputChange}></input>
                ) : (
                  <span>{message.body}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Room;
