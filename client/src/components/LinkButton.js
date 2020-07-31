import React from 'react';

const LinkButton = ({ handleShareLink }) => {
    return (
        <div className="link-control">
            <div className="btn-link">
                <button
                    className="btn"
                    onClick={handleShareLink}
                    title="Open Link"
                >
                    <span className="icon icon-link"></span>
                </button>
            </div>
        </div>
    );
};

export default LinkButton;
