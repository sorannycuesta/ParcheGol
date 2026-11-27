--
-- PostgreSQL database dump
--

\restrict tFIEm6Hex50LAAVlnVxo76y8VfxofcsFTGIW5wi50fNtdWk05LY52tSwcl867qm

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-26 21:41:26

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 877 (class 1247 OID 16906)
-- Name: metodo_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_enum AS ENUM (
    'nequi',
    'daviplata',
    'efectivo',
    'tarjeta',
    'transferencia'
);


ALTER TYPE public.metodo_pago_enum OWNER TO postgres;

--
-- TOC entry 859 (class 1247 OID 16805)
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_usuario AS ENUM (
    'usuario',
    'admin'
);


ALTER TYPE public.rol_usuario OWNER TO postgres;

--
-- TOC entry 865 (class 1247 OID 16831)
-- Name: servicio_cancha; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.servicio_cancha AS ENUM (
    'balon',
    'petos',
    'hidratacion'
);


ALTER TYPE public.servicio_cancha OWNER TO postgres;

--
-- TOC entry 874 (class 1247 OID 16898)
-- Name: tipo_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_pago_enum AS ENUM (
    'anticipo',
    'saldo',
    'total'
);


ALTER TYPE public.tipo_pago_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16838)
-- Name: canchas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canchas (
    id_cancha integer NOT NULL,
    foto_cancha text,
    nombre_cancha character varying(120) NOT NULL,
    descripcion text,
    categoria character varying(60),
    servicios_incluidos public.servicio_cancha[],
    hora_apertura time without time zone NOT NULL,
    hora_cierre time without time zone NOT NULL,
    cantidad_jugadores integer NOT NULL,
    ubicacion character varying(200) NOT NULL,
    precio numeric(12,2) NOT NULL,
    enlace_ubicacion text,
    id_usuario_admin integer NOT NULL,
    rol_admin public.rol_usuario DEFAULT 'admin'::public.rol_usuario NOT NULL,
    CONSTRAINT ck_canchas_enlace CHECK (((enlace_ubicacion IS NULL) OR (enlace_ubicacion ~* '^https?://'::text))),
    CONSTRAINT ck_canchas_horario CHECK ((hora_apertura <> hora_cierre)),
    CONSTRAINT ck_canchas_jugadores CHECK ((cantidad_jugadores > 0)),
    CONSTRAINT ck_canchas_nombre_no_vacio CHECK ((length(TRIM(BOTH FROM nombre_cancha)) > 0)),
    CONSTRAINT ck_canchas_precio CHECK ((precio >= (0)::numeric)),
    CONSTRAINT ck_canchas_rol_admin CHECK ((rol_admin = 'admin'::public.rol_usuario))
);


ALTER TABLE public.canchas OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16837)
-- Name: canchas_id_cancha_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.canchas_id_cancha_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.canchas_id_cancha_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 221
-- Name: canchas_id_cancha_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.canchas_id_cancha_seq OWNED BY public.canchas.id_cancha;


--
-- TOC entry 226 (class 1259 OID 16918)
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    codigo_reserva integer NOT NULL,
    estado_pago boolean DEFAULT false NOT NULL,
    tipo_pago public.tipo_pago_enum NOT NULL,
    monto numeric(10,2) NOT NULL,
    metodo_pago public.metodo_pago_enum NOT NULL,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_pago_monto CHECK ((monto > (0)::numeric))
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16917)
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_id_pago_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 225
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- TOC entry 224 (class 1259 OID 16867)
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    codigo_reserva integer NOT NULL,
    nombre_usuario character varying(100) NOT NULL,
    telefono character varying(20) NOT NULL,
    fecha_reserva date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    duracion integer NOT NULL,
    costo numeric(10,2) NOT NULL,
    estado_reserva character varying(30) DEFAULT 'pendiente_anticipo'::character varying NOT NULL,
    id_cancha integer NOT NULL,
    id_usuario integer NOT NULL,
    CONSTRAINT ck_reservas_costo CHECK ((costo >= (0)::numeric)),
    CONSTRAINT ck_reservas_duracion CHECK ((duracion > 0)),
    CONSTRAINT ck_reservas_estado CHECK (((estado_reserva)::text = ANY ((ARRAY['pendiente_anticipo'::character varying, 'anticipo_pagado'::character varying, 'pago_completo'::character varying, 'cancelada'::character varying])::text[])))
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16866)
-- Name: reservas_codigo_reserva_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_codigo_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_codigo_reserva_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 223
-- Name: reservas_codigo_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_codigo_reserva_seq OWNED BY public.reservas.codigo_reserva;


--
-- TOC entry 220 (class 1259 OID 16810)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre_completo character varying(120) NOT NULL,
    telefono character varying(25) NOT NULL,
    correo character varying(150) NOT NULL,
    contrasena character varying(255) NOT NULL,
    rol public.rol_usuario DEFAULT 'usuario'::public.rol_usuario NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16809)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 4886 (class 2604 OID 16841)
-- Name: canchas id_cancha; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canchas ALTER COLUMN id_cancha SET DEFAULT nextval('public.canchas_id_cancha_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16921)
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 16870)
-- Name: reservas codigo_reserva; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN codigo_reserva SET DEFAULT nextval('public.reservas_codigo_reserva_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 16813)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 5072 (class 0 OID 16838)
-- Dependencies: 222
-- Data for Name: canchas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.canchas (id_cancha, foto_cancha, nombre_cancha, descripcion, categoria, servicios_incluidos, hora_apertura, hora_cierre, cantidad_jugadores, ubicacion, precio, enlace_ubicacion, id_usuario_admin, rol_admin) FROM stdin;
1	/assets/img/cancha-el-templo.jpg	Cancha El Templo	Cancha sintetica iluminada para partidos en Bogota	Fútbol 5	{petos,hidratacion}	08:00:00	22:00:00	10	Villa Alsacia, Bogotá	90000.00	https://maps.google.com/?q=4.6486,-74.1450	1	admin
2	/assets/img/la-bombonera.jpg	Cancha La Bombonera Prueba	Cancha de prueba asignada a administrador	Futbol 7	{balon}	09:00:00	23:00:00	14	Kennedy, Bogota	120000.00	https://maps.google.com/?q=4.6300,-74.1500	1	admin
\.


--
-- TOC entry 5076 (class 0 OID 16918)
-- Dependencies: 226
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, codigo_reserva, estado_pago, tipo_pago, monto, metodo_pago, fecha_pago) FROM stdin;
1	1	t	anticipo	30000.00	nequi	2026-11-26 12:37:49.668665
\.


--
-- TOC entry 5074 (class 0 OID 16867)
-- Dependencies: 224
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas (codigo_reserva, nombre_usuario, telefono, fecha_reserva, hora_inicio, duracion, costo, estado_reserva, id_cancha, id_usuario) FROM stdin;
1	Juan Jugador Prueba	3152223344	2026-12-06	19:00:00	1	90000.00	pendiente_anticipo	1	2
\.


--
-- TOC entry 5070 (class 0 OID 16810)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nombre_completo, telefono, correo, contrasena, rol, fecha_creacion) FROM stdin;
1	Carlos Admin Prueba	3001112233	carlos.admin.prueba@parchegol.com	clave_prueba_123	admin	2026-11-26 12:19:44.519757-05
2	Juan Jugador Prueba	3152223344	juan.jugador.prueba@parchegol.com	clave_jugador_123	usuario	2026-11-26 12:29:02.535496-05
3	Admin Prueba	3001112233	admin.prueba@parchegol.test	hash_demo	admin	2026-11-26 13:18:04.590163-05
4	Usuario Normal	3004445566	usuario.normal@parchegol.test	hash_demo	usuario	2026-11-26 13:18:04.590163-05
\.


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 221
-- Name: canchas_id_cancha_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canchas_id_cancha_seq', 8, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 225
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 1, true);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 223
-- Name: reservas_codigo_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_codigo_reserva_seq', 1, true);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 4, true);


--
-- TOC entry 4916 (class 2606 OID 16933)
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- TOC entry 4910 (class 2606 OID 16858)
-- Name: canchas pk_canchas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT pk_canchas PRIMARY KEY (id_cancha);


--
-- TOC entry 4914 (class 2606 OID 16886)
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (codigo_reserva);


--
-- TOC entry 4912 (class 2606 OID 16860)
-- Name: canchas uq_canchas_nombre; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT uq_canchas_nombre UNIQUE (nombre_cancha);


--
-- TOC entry 4904 (class 2606 OID 16829)
-- Name: usuarios uq_usuarios_id_rol; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT uq_usuarios_id_rol UNIQUE (id_usuario, rol);


--
-- TOC entry 4906 (class 2606 OID 16827)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 4908 (class 2606 OID 16825)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4917 (class 2606 OID 16861)
-- Name: canchas fk_canchas_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT fk_canchas_usuario FOREIGN KEY (id_usuario_admin) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4918 (class 2606 OID 16945)
-- Name: canchas fk_canchas_usuario_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT fk_canchas_usuario_admin FOREIGN KEY (id_usuario_admin, rol_admin) REFERENCES public.usuarios(id_usuario, rol) ON DELETE RESTRICT;


--
-- TOC entry 4921 (class 2606 OID 16934)
-- Name: pago fk_pago_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_pago_reserva FOREIGN KEY (codigo_reserva) REFERENCES public.reservas(codigo_reserva) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4919 (class 2606 OID 16887)
-- Name: reservas fk_reservas_canchas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_reservas_canchas FOREIGN KEY (id_cancha) REFERENCES public.canchas(id_cancha) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4920 (class 2606 OID 16892)
-- Name: reservas fk_reservas_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_reservas_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-11-26 21:41:27

--
-- PostgreSQL database dump complete
--

\unrestrict tFIEm6Hex50LAAVlnVxo76y8VfxofcsFTGIW5wi50fNtdWk05LY52tSwcl867qm

