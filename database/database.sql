CREATE DATABASE tiendanode;
USE tiendanode;

CREATE TABLE IF NOT EXISTS marcas(
	id 				INT AUTO_INCREMENT PRIMARY KEY,
    nombremarca		VARCHAR(100) NOT NULL,
    create_at 		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at 		TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)engine = InnoDB;

/*insert into marcas(nombremarca) values ('Samsung');
insert into marcas(nombremarca) values ('AMD');*/


-- Garantia en meses
create table if not exists productos(
	id 			int auto_increment primary key,
    idmarca	 	int not null,
    nombre 		varchar(150) not null,
    precio 		decimal(7,2) not null,
    garantia 	tinyint comment 'Se debera indicar en meses',
    descripcion varchar(100) not null,
    fechacompra date not null,
    create_at 	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at 	TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    constraint fk_idmarca_prd foreign key (idmarca) references  marcas (id)
)engine = InnoDB;

insert into productos
		(idmarca, nombre, precio, garantia, descripcion, fechacompra)
		values
		(1,'Monitor',400,24,'resolucion full hd - 60h','2026-02-01'),
		(2,'Microprocesador',700,12,'Ryzen 5 - 5200','2026-03-10');

update productos set descripcion = 'resolucion full hd -120hz' where id=1;
select * from  productos;