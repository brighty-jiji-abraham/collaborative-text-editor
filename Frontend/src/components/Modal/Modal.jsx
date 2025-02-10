// Modal.jsx
import React from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import Button from '../Button/Button';
import { FaCircleXmark } from "react-icons/fa6";

import './Modal.css'; // You can create a Modal.css file for styling

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <Button Name="modal-close-button close-btn" iconComponent={ <FaCircleXmark /> } onClick={onClose} />
                {children}
            </div>
        </div>,
        document.body // Mount the modal to the body to avoid stacking context issues
    );
};

export default Modal;