import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateContact from './fileTransfer/CreateContact';
import Contact from './fileTransfer/Contact';

function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={CreateContact} />
                <Route path="/contact/:id" component={Contact} />
            </Switch>
        </BrowserRouter>
    );
}

export default App;
