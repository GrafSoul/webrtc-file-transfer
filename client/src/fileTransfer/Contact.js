import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import streamSaver from 'streamsaver';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ExitButton from '../components/ExitButton';
import LinkButton from '../components/LinkButton';
import LinkContact from '../components/LinkContact';
import Loader from '../components/Loader';

const worker = new Worker('../worker.js');

const Contact = ({ history, match }) => {
    const [spinner, setSpinner] = useState(false);
    const [connectionEstablished, setConnection] = useState(false);
    const [file, setFile] = useState();
    const [gotFile, setGotFile] = useState(false);

    const [isCopied, setIsCopied] = useState(false);
    const [shareLink, setShareLink] = useState(false);
    let body;
    let downloadPrompt;

    const socketRef = useRef();
    const peerRef = useRef();
    const fileNameRef = useRef('');

    useEffect(() => {
        setTimeout(() => setSpinner(true), 1000);
    });

    useEffect(() => {
        socketRef.current = io.connect('/');
        socketRef.current.emit('join room', match.params.id);
        socketRef.current.on('all users', (users) => {
            peerRef.current = createPeer(users[0], socketRef.current.id);
        });

        socketRef.current.on('user joined', (payload) => {
            peerRef.current = addPeer(payload.signal, payload.callerID);
        });

        socketRef.current.on('receiving returned signal', (payload) => {
            peerRef.current.signal(payload.signal);
            setConnection(true);
        });

        socketRef.current.on('room full', () => {
            alert('room is full');
        });

        function createPeer(userToSignal, callerID) {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                config: {
                    iceServers: [
                        {
                            urls: 'stun:stun.stunprotocol.org',
                        },
                        {
                            urls: 'turn:numb.viagenie.ca',
                            credential: 'vidokchat',
                            username: 'networkroom@live.com',
                        },
                    ],
                },
            });

            peer.on('signal', (signal) => {
                socketRef.current.emit('sending signal', {
                    userToSignal,
                    callerID,
                    signal,
                });
            });

            peer.on('data', handleReceivingData);

            return peer;
        }

        function addPeer(incomingSignal, callerID) {
            const peer = new Peer({
                initiator: false,
                trickle: false,
            });

            peer.on('signal', (signal) => {
                socketRef.current.emit('returning signal', {
                    signal,
                    callerID,
                });
            });

            peer.on('data', handleReceivingData);

            peer.signal(incomingSignal);
            setConnection(true);
            return peer;
        }
    }, [match]);

    function handleReceivingData(data) {
        if (data.toString().includes('done')) {
            setGotFile(true);
            const parsed = JSON.parse(data);
            fileNameRef.current = parsed.fileName;
        } else {
            worker.postMessage(data);
        }
    }

    function download() {
        setGotFile(false);
        worker.postMessage('download');
        worker.addEventListener('message', (event) => {
            const stream = event.data.stream();
            const fileStream = streamSaver.WritableStream(fileNameRef.current);
            stream.pipeTo(fileStream);
        });
    }

    function selectFile(e) {
        setFile(e.target.files[0]);
    }

    function sendFile() {
        const peer = peerRef.current;
        const stream = file.stream();
        const reader = stream.getReader();

        reader.read().then((obj) => {
            handleReading(obj.done, obj.value);
        });

        function handleReading(done, value) {
            if (done) {
                peer.write(JSON.stringify({ done: true, fileName: file.name }));
                return;
            }

            peer.write(value);
            reader.read().then((obj) => {
                handleReading(obj.done, obj.value);
            });
        }
    }

    function handleCopyLink(url) {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1000);
            })
            .catch((err) => {
                console.log('Something went wrong', err);
            });

        setTimeout(() => {
            handleShareLink();
        }, 1800);
    }

    function handleShareLink() {
        setShareLink(!shareLink);
    }

    const exitRoom = () => {
        history.push('/');
    };

    if (connectionEstablished) {
        body = (
            <div className="add-file">
                <input onChange={selectFile} type="file" />
                <button onClick={sendFile}>Send file</button>
            </div>
        );
    } else {
        body = (
            <div className="expectation">
                <h1>Wait for connection!</h1>
                <h2>
                    Once you have a peer connection, you will be able to share
                    files
                </h2>
            </div>
        );
    }

    if (gotFile) {
        downloadPrompt = (
            <div className="download-file">
                <span className="info">
                    You have received a file. Would you like to download the
                    file?
                </span>
                <button onClick={download}>Download</button>
            </div>
        );
    }

    return (
        <>
            <Header />
            <ExitButton exitRoom={exitRoom} />
            <LinkButton handleShareLink={handleShareLink} />
            <LinkContact
                shareLink={shareLink}
                handleShareLink={handleShareLink}
                handleCopyLink={handleCopyLink}
                copied={isCopied}
                url={window.location.href}
            />
            <div className="container">
                <div className="contact">
                    {!gotFile && body}
                    {downloadPrompt}
                </div>
            </div>
            <Footer />
            {!spinner && (
                <div className="loader">
                    <Loader />
                </div>
            )}
        </>
    );
};

export default Contact;
