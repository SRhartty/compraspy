CREATE DATABASE compraspy;
USE compraspy;

CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL UNIQUE,
    link_compras VARCHAR(255) NOT NULL,
    preco FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);