import React from 'react';
import { v1 as uuid } from 'uuid';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CopyLink from '../components/CopyLink';
import QRCodeImage from '../components/QRCodeImage';

const CreateContact = ({ history }) => {
    const id = uuid();
    const url = window.location.href + `contact/${id}`;

    function createContact() {
        history.push(`/contact/${id}`);
    }

    return (
        <>
            <Header />
            <div className="container">
                <section className="create-room">
                    <div className="crete-info">
                        <p>
                            <strong>SEND.OK</strong> - Web application allowing
                            to create a secure channel between two browsers for
                            forwarding large files.
                        </p>
                        <p>
                            To create a connection, click on the button -{' '}
                            <strong>"Create New Contact"</strong> and send a
                            link to the person you want to send or get files
                            from him.
                        </p>
                    </div>

                    <div className="link-url">
                        <CopyLink url={url} />
                        <p>{url}</p>
                    </div>

                    <div className="qrcode">
                        <QRCodeImage url={url} />
                    </div>

                    <div className="btn-go">
                        <button onClick={createContact}>
                            Create New Contact
                        </button>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default CreateContact;
