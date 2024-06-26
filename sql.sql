CREATE DATABASE compraspy;
USE compraspy;

CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL UNIQUE,
    link_compras VARCHAR(255) NOT NULL,
    preco FLOAT,
    current_status VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);