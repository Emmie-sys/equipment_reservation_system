--
-- PostgreSQL database dump
--

\restrict TPM08vLb5hbnpIKDVcdTKx87Kz1jxVQp9Yuql5o8KC6BAHZxbTgCWdJqx1ezHVU

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_terms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academic_terms (
    term_id bigint NOT NULL,
    term_name character varying(50) NOT NULL,
    academic_year character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    CONSTRAINT academic_terms_check CHECK ((end_date > start_date))
);


ALTER TABLE public.academic_terms OWNER TO postgres;

--
-- Name: academic_terms_term_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.academic_terms ALTER COLUMN term_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.academic_terms_term_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approvals (
    approval_id bigint NOT NULL,
    reservation_id bigint NOT NULL,
    approver_user_id bigint NOT NULL,
    decision character varying(30) NOT NULL,
    decision_reason text,
    decided_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT approvals_decision_check CHECK (((decision)::text = ANY (ARRAY[('approved'::character varying)::text, ('rejected'::character varying)::text, ('conditionally_approved'::character varying)::text])))
);


ALTER TABLE public.approvals OWNER TO postgres;

--
-- Name: approvals_approval_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.approvals ALTER COLUMN approval_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.approvals_approval_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    attachment_id bigint NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id bigint NOT NULL,
    file_url character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    mime_type character varying(100),
    uploaded_by_user_id bigint,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: attachments_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.attachments ALTER COLUMN attachment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.attachments_attachment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    audit_log_id bigint NOT NULL,
    user_id bigint,
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id bigint,
    old_value jsonb,
    new_value jsonb,
    ip_address inet,
    performed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ALTER COLUMN audit_log_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_logs_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: blackout_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blackout_periods (
    blackout_id bigint NOT NULL,
    room_id bigint,
    category_id bigint,
    equipment_id bigint,
    reason character varying(255) NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    created_by_user_id bigint,
    CONSTRAINT blackout_periods_check CHECK ((end_datetime > start_datetime))
);


ALTER TABLE public.blackout_periods OWNER TO postgres;

--
-- Name: blackout_periods_blackout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.blackout_periods ALTER COLUMN blackout_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.blackout_periods_blackout_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buildings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buildings (
    building_id bigint NOT NULL,
    campus_id bigint NOT NULL,
    building_name character varying(150) NOT NULL,
    building_code character varying(20) NOT NULL,
    number_of_floors smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.buildings OWNER TO postgres;

--
-- Name: buildings_building_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.buildings ALTER COLUMN building_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.buildings_building_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: campuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campuses (
    campus_id bigint NOT NULL,
    campus_name character varying(150) NOT NULL,
    campus_code character varying(20) NOT NULL,
    address_line character varying(255),
    city character varying(100),
    country character varying(100) DEFAULT 'Uganda'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campuses OWNER TO postgres;

--
-- Name: campuses_campus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.campuses ALTER COLUMN campus_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.campuses_campus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: certification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_types (
    certification_id bigint NOT NULL,
    certification_name character varying(150) NOT NULL,
    description text,
    validity_period_months integer
);


ALTER TABLE public.certification_types OWNER TO postgres;

--
-- Name: certification_types_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.certification_types ALTER COLUMN certification_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.certification_types_certification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: checkout_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkout_records (
    checkout_id bigint NOT NULL,
    reservation_item_id bigint NOT NULL,
    released_by_user_id bigint NOT NULL,
    received_by_user_id bigint NOT NULL,
    condition_at_checkout text,
    checkout_datetime timestamp with time zone DEFAULT now() NOT NULL,
    expected_return_datetime timestamp with time zone NOT NULL
);


ALTER TABLE public.checkout_records OWNER TO postgres;

--
-- Name: checkout_records_checkout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.checkout_records ALTER COLUMN checkout_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.checkout_records_checkout_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: condition_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.condition_reports (
    condition_report_id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    reservation_item_id bigint,
    reported_by_user_id bigint NOT NULL,
    report_type character varying(20) NOT NULL,
    condition_summary text NOT NULL,
    damage_found boolean DEFAULT false NOT NULL,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT condition_reports_report_type_check CHECK (((report_type)::text = ANY ((ARRAY['checkout'::character varying, 'return'::character varying, 'inspection'::character varying])::text[])))
);


ALTER TABLE public.condition_reports OWNER TO postgres;

--
-- Name: condition_reports_condition_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.condition_reports ALTER COLUMN condition_report_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.condition_reports_condition_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: course_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_instructors (
    course_instructor_id bigint NOT NULL,
    offering_id bigint NOT NULL,
    instructor_id bigint NOT NULL,
    role_in_course character varying(50) DEFAULT 'Lead'::character varying NOT NULL
);


ALTER TABLE public.course_instructors OWNER TO postgres;

--
-- Name: course_instructors_course_instructor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.course_instructors ALTER COLUMN course_instructor_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.course_instructors_course_instructor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: course_offerings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_offerings (
    offering_id bigint NOT NULL,
    course_id bigint NOT NULL,
    term_id bigint NOT NULL,
    section_label character varying(20) DEFAULT 'A'::character varying,
    default_room_id bigint,
    max_class_size integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course_offerings OWNER TO postgres;

--
-- Name: course_offerings_offering_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.course_offerings ALTER COLUMN offering_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.course_offerings_offering_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_id bigint NOT NULL,
    department_id bigint NOT NULL,
    course_code character varying(20) NOT NULL,
    course_title character varying(200) NOT NULL,
    description text,
    credit_units numeric(4,1) DEFAULT 0 NOT NULL,
    requires_practical_equipment boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.courses ALTER COLUMN course_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.courses_course_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id bigint NOT NULL,
    faculty_id bigint NOT NULL,
    department_name character varying(150) NOT NULL,
    department_code character varying(20) NOT NULL,
    head_of_department_user_id bigint,
    office_location character varying(150),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.departments ALTER COLUMN department_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.departments_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    enrollment_id bigint NOT NULL,
    offering_id bigint NOT NULL,
    student_id bigint NOT NULL,
    enrollment_date date DEFAULT CURRENT_DATE NOT NULL,
    enrollment_status character varying(20) DEFAULT 'enrolled'::character varying NOT NULL,
    CONSTRAINT enrollments_enrollment_status_check CHECK (((enrollment_status)::text = ANY ((ARRAY['enrolled'::character varying, 'dropped'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: enrollments_enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.enrollments ALTER COLUMN enrollment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.enrollments_enrollment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    equipment_id bigint NOT NULL,
    model_id bigint NOT NULL,
    asset_tag character varying(50) NOT NULL,
    serial_number character varying(100),
    status_id bigint NOT NULL,
    current_room_id bigint,
    purchase_date date,
    purchase_cost numeric(12,2),
    warranty_expiry_date date,
    condition_notes text,
    barcode_value character varying(100),
    is_bookable boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_accessories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_accessories (
    accessory_id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    accessory_name character varying(150) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    is_mandatory_with_checkout boolean DEFAULT true NOT NULL
);


ALTER TABLE public.equipment_accessories OWNER TO postgres;

--
-- Name: equipment_accessories_accessory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_accessories ALTER COLUMN accessory_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_accessories_accessory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_categories (
    category_id bigint NOT NULL,
    parent_category_id bigint,
    category_name character varying(150) NOT NULL,
    category_code character varying(30) NOT NULL,
    description text,
    requires_certification boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.equipment_categories OWNER TO postgres;

--
-- Name: equipment_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_categories ALTER COLUMN category_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_categories_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_certification_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_certification_requirements (
    requirement_id bigint NOT NULL,
    model_id bigint NOT NULL,
    certification_id bigint NOT NULL
);


ALTER TABLE public.equipment_certification_requirements OWNER TO postgres;

--
-- Name: equipment_certification_requirements_requirement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_certification_requirements ALTER COLUMN requirement_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_certification_requirements_requirement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment ALTER COLUMN equipment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_images (
    image_id bigint NOT NULL,
    equipment_id bigint,
    model_id bigint,
    image_url character varying(255) NOT NULL,
    caption character varying(255),
    uploaded_by_user_id bigint,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT equipment_images_check CHECK (((equipment_id IS NOT NULL) OR (model_id IS NOT NULL)))
);


ALTER TABLE public.equipment_images OWNER TO postgres;

--
-- Name: equipment_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_images ALTER COLUMN image_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_images_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_kits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_kits (
    kit_id bigint NOT NULL,
    kit_name character varying(150) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.equipment_kits OWNER TO postgres;

--
-- Name: equipment_kits_kit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_kits ALTER COLUMN kit_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_kits_kit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_location_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_location_history (
    location_history_id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    room_id bigint NOT NULL,
    moved_by_user_id bigint,
    moved_at timestamp with time zone DEFAULT now() NOT NULL,
    reason character varying(255)
);


ALTER TABLE public.equipment_location_history OWNER TO postgres;

--
-- Name: equipment_location_history_location_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_location_history ALTER COLUMN location_history_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_location_history_location_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_models (
    model_id bigint NOT NULL,
    category_id bigint NOT NULL,
    supplier_id bigint,
    model_name character varying(150) NOT NULL,
    manufacturer character varying(150),
    model_number character varying(100),
    specifications text,
    standard_usage_instructions text,
    unit_of_measure character varying(30) DEFAULT 'unit'::character varying NOT NULL,
    replacement_cost numeric(12,2),
    requires_certification boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.equipment_models OWNER TO postgres;

--
-- Name: equipment_models_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_models ALTER COLUMN model_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_models_model_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_status_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_status_types (
    status_id bigint NOT NULL,
    status_name character varying(30) NOT NULL
);


ALTER TABLE public.equipment_status_types OWNER TO postgres;

--
-- Name: equipment_status_types_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_status_types ALTER COLUMN status_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_status_types_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_tag_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_tag_map (
    equipment_tag_map_id bigint NOT NULL,
    model_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.equipment_tag_map OWNER TO postgres;

--
-- Name: equipment_tag_map_equipment_tag_map_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_tag_map ALTER COLUMN equipment_tag_map_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_tag_map_equipment_tag_map_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_tags (
    tag_id bigint NOT NULL,
    tag_name character varying(50) NOT NULL
);


ALTER TABLE public.equipment_tags OWNER TO postgres;

--
-- Name: equipment_tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment_tags ALTER COLUMN tag_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_tags_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    faculty_id bigint NOT NULL,
    campus_id bigint NOT NULL,
    faculty_name character varying(150) NOT NULL,
    faculty_code character varying(20) NOT NULL,
    dean_user_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- Name: faculties_faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.faculties ALTER COLUMN faculty_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.faculties_faculty_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructors (
    instructor_id bigint NOT NULL,
    user_id bigint NOT NULL,
    staff_number character varying(30) NOT NULL,
    department_id bigint NOT NULL,
    academic_rank character varying(50),
    office_room_id bigint,
    employment_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    date_joined date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT instructors_employment_status_check CHECK (((employment_status)::text = ANY ((ARRAY['active'::character varying, 'on_leave'::character varying, 'retired'::character varying, 'terminated'::character varying])::text[])))
);


ALTER TABLE public.instructors OWNER TO postgres;

--
-- Name: instructors_instructor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.instructors ALTER COLUMN instructor_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.instructors_instructor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: kit_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kit_items (
    kit_item_id bigint NOT NULL,
    kit_id bigint NOT NULL,
    model_id bigint NOT NULL,
    quantity_required integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.kit_items OWNER TO postgres;

--
-- Name: kit_items_kit_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.kit_items ALTER COLUMN kit_item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.kit_items_kit_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: maintenance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_records (
    maintenance_record_id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    schedule_id bigint,
    performed_by_user_id bigint,
    external_vendor_id bigint,
    work_description text NOT NULL,
    cost numeric(12,2) DEFAULT 0,
    outcome character varying(30),
    started_at timestamp with time zone NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT maintenance_records_outcome_check CHECK (((outcome)::text = ANY ((ARRAY['resolved'::character varying, 'partially_resolved'::character varying, 'unresolved'::character varying, 'equipment_retired'::character varying])::text[])))
);


ALTER TABLE public.maintenance_records OWNER TO postgres;

--
-- Name: maintenance_records_maintenance_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.maintenance_records ALTER COLUMN maintenance_record_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.maintenance_records_maintenance_record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: maintenance_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_schedules (
    schedule_id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    maintenance_type character varying(50) NOT NULL,
    frequency_days integer,
    next_due_date date NOT NULL,
    last_completed_date date,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.maintenance_schedules OWNER TO postgres;

--
-- Name: maintenance_schedules_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.maintenance_schedules ALTER COLUMN schedule_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.maintenance_schedules_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_types (
    notification_type_id bigint NOT NULL,
    type_name character varying(50) NOT NULL
);


ALTER TABLE public.notification_types OWNER TO postgres;

--
-- Name: notification_types_notification_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notification_types ALTER COLUMN notification_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notification_types_notification_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id bigint NOT NULL,
    user_id bigint NOT NULL,
    notification_type_id bigint NOT NULL,
    related_reservation_id bigint,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ALTER COLUMN notification_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notifications_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    token_id bigint NOT NULL,
    user_id bigint NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN token_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    transaction_id bigint NOT NULL,
    penalty_id bigint NOT NULL,
    paid_by_user_id bigint NOT NULL,
    amount_paid numeric(12,2) NOT NULL,
    payment_method character varying(30),
    payment_reference character varying(100),
    paid_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: payment_transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_transactions ALTER COLUMN transaction_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.payment_transactions_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: penalties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.penalties (
    penalty_id bigint NOT NULL,
    violation_id bigint NOT NULL,
    penalty_type_id bigint NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    suspension_start_date date,
    suspension_end_date date,
    resolution_status character varying(20) DEFAULT 'unresolved'::character varying NOT NULL,
    imposed_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT penalties_resolution_status_check CHECK (((resolution_status)::text = ANY ((ARRAY['unresolved'::character varying, 'resolved'::character varying, 'waived'::character varying])::text[])))
);


ALTER TABLE public.penalties OWNER TO postgres;

--
-- Name: penalties_penalty_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.penalties ALTER COLUMN penalty_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.penalties_penalty_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: penalty_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.penalty_types (
    penalty_type_id bigint NOT NULL,
    penalty_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.penalty_types OWNER TO postgres;

--
-- Name: penalty_types_penalty_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.penalty_types ALTER COLUMN penalty_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.penalty_types_penalty_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.programs (
    program_id bigint NOT NULL,
    department_id bigint NOT NULL,
    program_name character varying(150) NOT NULL,
    program_code character varying(20) NOT NULL,
    award_level character varying(50) NOT NULL,
    duration_years numeric(3,1) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.programs OWNER TO postgres;

--
-- Name: programs_program_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.programs ALTER COLUMN program_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.programs_program_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservation_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_items (
    reservation_item_id bigint NOT NULL,
    reservation_id bigint NOT NULL,
    model_id bigint,
    equipment_id bigint,
    kit_id bigint,
    quantity_requested integer DEFAULT 1 NOT NULL,
    line_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    CONSTRAINT reservation_items_check CHECK (((model_id IS NOT NULL) OR (kit_id IS NOT NULL))),
    CONSTRAINT reservation_items_line_status_check CHECK (((line_status)::text = ANY ((ARRAY['pending'::character varying, 'allocated'::character varying, 'checked_out'::character varying, 'returned'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.reservation_items OWNER TO postgres;

--
-- Name: reservation_items_reservation_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservation_items ALTER COLUMN reservation_item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reservation_items_reservation_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservation_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_policies (
    policy_id bigint NOT NULL,
    role_id bigint,
    category_id bigint,
    max_loan_duration_hours integer DEFAULT 72 NOT NULL,
    max_concurrent_reservations integer DEFAULT 3 NOT NULL,
    max_advance_booking_days integer DEFAULT 30 NOT NULL,
    min_advance_booking_hours integer DEFAULT 2 NOT NULL,
    requires_instructor_approval boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    effective_from date DEFAULT CURRENT_DATE NOT NULL,
    effective_to date
);


ALTER TABLE public.reservation_policies OWNER TO postgres;

--
-- Name: reservation_policies_policy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservation_policies ALTER COLUMN policy_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reservation_policies_policy_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservation_purpose_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_purpose_types (
    purpose_type_id bigint NOT NULL,
    purpose_name character varying(100) NOT NULL
);


ALTER TABLE public.reservation_purpose_types OWNER TO postgres;

--
-- Name: reservation_purpose_types_purpose_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservation_purpose_types ALTER COLUMN purpose_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reservation_purpose_types_purpose_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservation_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_status_history (
    history_id bigint NOT NULL,
    reservation_id bigint NOT NULL,
    old_status_id bigint,
    new_status_id bigint NOT NULL,
    changed_by_user_id bigint,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    remarks text
);


ALTER TABLE public.reservation_status_history OWNER TO postgres;

--
-- Name: reservation_status_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservation_status_history ALTER COLUMN history_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reservation_status_history_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservation_status_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_status_types (
    status_id bigint NOT NULL,
    status_name character varying(30) NOT NULL
);


ALTER TABLE public.reservation_status_types OWNER TO postgres;

--
-- Name: reservation_status_types_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservation_status_types ALTER COLUMN status_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reservation_status_types_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    reservation_id bigint NOT NULL,
    requested_by_user_id bigint NOT NULL,
    course_offering_id bigint,
    purpose_type_id bigint NOT NULL,
    purpose_details text,
    status_id bigint NOT NULL,
    requested_start_datetime timestamp with time zone NOT NULL,
    requested_end_datetime timestamp with time zone NOT NULL,
    pickup_room_id bigint,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reservations_check CHECK ((requested_end_datetime > requested_start_datetime))
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservations ALTER COLUMN reservation_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reservations_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: return_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_records (
    return_id bigint NOT NULL,
    checkout_id bigint NOT NULL,
    returned_by_user_id bigint NOT NULL,
    received_by_user_id bigint NOT NULL,
    condition_at_return text,
    actual_return_datetime timestamp with time zone DEFAULT now() NOT NULL,
    is_late boolean DEFAULT false NOT NULL,
    late_by_minutes integer DEFAULT 0
);


ALTER TABLE public.return_records OWNER TO postgres;

--
-- Name: return_records_return_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.return_records ALTER COLUMN return_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.return_records_return_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id bigint NOT NULL,
    role_name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN role_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_id bigint NOT NULL,
    building_id bigint NOT NULL,
    room_code character varying(30) NOT NULL,
    room_name character varying(150),
    room_type character varying(50) NOT NULL,
    floor_number smallint,
    capacity integer,
    is_bookable_space boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.rooms ALTER COLUMN room_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.rooms_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staff_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_members (
    staff_member_id bigint NOT NULL,
    user_id bigint NOT NULL,
    staff_number character varying(30) NOT NULL,
    department_id bigint,
    job_title character varying(100) NOT NULL,
    assigned_room_id bigint,
    employment_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    date_joined date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT staff_members_employment_status_check CHECK (((employment_status)::text = ANY ((ARRAY['active'::character varying, 'on_leave'::character varying, 'retired'::character varying, 'terminated'::character varying])::text[])))
);


ALTER TABLE public.staff_members OWNER TO postgres;

--
-- Name: staff_members_staff_member_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.staff_members ALTER COLUMN staff_member_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.staff_members_staff_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id bigint NOT NULL,
    user_id bigint NOT NULL,
    registration_number character varying(30) NOT NULL,
    program_id bigint NOT NULL,
    year_of_study smallint NOT NULL,
    enrollment_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    admission_date date,
    expected_graduation_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT students_enrollment_status_check CHECK (((enrollment_status)::text = ANY ((ARRAY['active'::character varying, 'on_leave'::character varying, 'graduated'::character varying, 'withdrawn'::character varying])::text[])))
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.students ALTER COLUMN student_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.students_student_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    supplier_id bigint NOT NULL,
    supplier_name character varying(150) NOT NULL,
    contact_person character varying(150),
    contact_email public.citext,
    contact_phone character varying(30),
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.suppliers ALTER COLUMN supplier_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.suppliers_supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    description text,
    updated_by_user_id bigint,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: user_certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_certifications (
    user_certification_id bigint NOT NULL,
    user_id bigint NOT NULL,
    certification_id bigint NOT NULL,
    issued_date date NOT NULL,
    expiry_date date,
    issued_by_user_id bigint,
    certificate_document_url character varying(255)
);


ALTER TABLE public.user_certifications OWNER TO postgres;

--
-- Name: user_certifications_user_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_certifications ALTER COLUMN user_certification_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_certifications_user_certification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_role_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_user_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles ALTER COLUMN user_role_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_roles_user_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    middle_name character varying(100),
    email public.citext NOT NULL,
    phone_number character varying(30),
    password_hash character varying(255) NOT NULL,
    date_of_birth date,
    gender character varying(20),
    national_id_number character varying(50),
    profile_photo_url character varying(255),
    campus_id bigint,
    account_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    email_verified_at timestamp with time zone,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_account_status_check CHECK (((account_status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'inactive'::character varying, 'locked'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: violation_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.violation_types (
    violation_type_id bigint NOT NULL,
    violation_name character varying(100) NOT NULL,
    default_penalty_description text
);


ALTER TABLE public.violation_types OWNER TO postgres;

--
-- Name: violation_types_violation_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.violation_types ALTER COLUMN violation_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.violation_types_violation_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: violations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.violations (
    violation_id bigint NOT NULL,
    user_id bigint NOT NULL,
    reservation_id bigint,
    violation_type_id bigint NOT NULL,
    description text,
    recorded_by_user_id bigint,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.violations OWNER TO postgres;

--
-- Name: violations_violation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.violations ALTER COLUMN violation_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.violations_violation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.waitlist (
    waitlist_id bigint NOT NULL,
    user_id bigint NOT NULL,
    model_id bigint NOT NULL,
    desired_start_datetime timestamp with time zone NOT NULL,
    desired_end_datetime timestamp with time zone NOT NULL,
    priority_rank integer,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    notified_at timestamp with time zone,
    CONSTRAINT waitlist_check CHECK ((desired_end_datetime > desired_start_datetime))
);


ALTER TABLE public.waitlist OWNER TO postgres;

--
-- Name: waitlist_waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.waitlist ALTER COLUMN waitlist_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.waitlist_waitlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: academic_terms academic_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_terms
    ADD CONSTRAINT academic_terms_pkey PRIMARY KEY (term_id);


--
-- Name: academic_terms academic_terms_term_name_academic_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_terms
    ADD CONSTRAINT academic_terms_term_name_academic_year_key UNIQUE (term_name, academic_year);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (approval_id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (attachment_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (audit_log_id);


--
-- Name: blackout_periods blackout_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blackout_periods
    ADD CONSTRAINT blackout_periods_pkey PRIMARY KEY (blackout_id);


--
-- Name: buildings buildings_building_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_building_code_key UNIQUE (building_code);


--
-- Name: buildings buildings_campus_id_building_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_campus_id_building_name_key UNIQUE (campus_id, building_name);


--
-- Name: buildings buildings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_pkey PRIMARY KEY (building_id);


--
-- Name: campuses campuses_campus_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campuses
    ADD CONSTRAINT campuses_campus_code_key UNIQUE (campus_code);


--
-- Name: campuses campuses_campus_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campuses
    ADD CONSTRAINT campuses_campus_name_key UNIQUE (campus_name);


--
-- Name: campuses campuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campuses
    ADD CONSTRAINT campuses_pkey PRIMARY KEY (campus_id);


--
-- Name: certification_types certification_types_certification_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_types
    ADD CONSTRAINT certification_types_certification_name_key UNIQUE (certification_name);


--
-- Name: certification_types certification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_types
    ADD CONSTRAINT certification_types_pkey PRIMARY KEY (certification_id);


--
-- Name: checkout_records checkout_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_records
    ADD CONSTRAINT checkout_records_pkey PRIMARY KEY (checkout_id);


--
-- Name: condition_reports condition_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_reports
    ADD CONSTRAINT condition_reports_pkey PRIMARY KEY (condition_report_id);


--
-- Name: course_instructors course_instructors_offering_id_instructor_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_offering_id_instructor_id_key UNIQUE (offering_id, instructor_id);


--
-- Name: course_instructors course_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_pkey PRIMARY KEY (course_instructor_id);


--
-- Name: course_offerings course_offerings_course_id_term_id_section_label_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_course_id_term_id_section_label_key UNIQUE (course_id, term_id, section_label);


--
-- Name: course_offerings course_offerings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_pkey PRIMARY KEY (offering_id);


--
-- Name: courses courses_course_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_code_key UNIQUE (course_code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- Name: departments departments_department_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_department_code_key UNIQUE (department_code);


--
-- Name: departments departments_faculty_id_department_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_department_name_key UNIQUE (faculty_id, department_name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: enrollments enrollments_offering_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_offering_id_student_id_key UNIQUE (offering_id, student_id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (enrollment_id);


--
-- Name: equipment_accessories equipment_accessories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_accessories
    ADD CONSTRAINT equipment_accessories_pkey PRIMARY KEY (accessory_id);


--
-- Name: equipment equipment_asset_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_asset_tag_key UNIQUE (asset_tag);


--
-- Name: equipment equipment_barcode_value_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_barcode_value_key UNIQUE (barcode_value);


--
-- Name: equipment_categories equipment_categories_category_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_categories
    ADD CONSTRAINT equipment_categories_category_code_key UNIQUE (category_code);


--
-- Name: equipment_categories equipment_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_categories
    ADD CONSTRAINT equipment_categories_pkey PRIMARY KEY (category_id);


--
-- Name: equipment_certification_requirements equipment_certification_requireme_model_id_certification_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_certification_requirements
    ADD CONSTRAINT equipment_certification_requireme_model_id_certification_id_key UNIQUE (model_id, certification_id);


--
-- Name: equipment_certification_requirements equipment_certification_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_certification_requirements
    ADD CONSTRAINT equipment_certification_requirements_pkey PRIMARY KEY (requirement_id);


--
-- Name: equipment_images equipment_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_images
    ADD CONSTRAINT equipment_images_pkey PRIMARY KEY (image_id);


--
-- Name: equipment_kits equipment_kits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_kits
    ADD CONSTRAINT equipment_kits_pkey PRIMARY KEY (kit_id);


--
-- Name: equipment_location_history equipment_location_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_location_history
    ADD CONSTRAINT equipment_location_history_pkey PRIMARY KEY (location_history_id);


--
-- Name: equipment_models equipment_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_models
    ADD CONSTRAINT equipment_models_pkey PRIMARY KEY (model_id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- Name: equipment equipment_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_serial_number_key UNIQUE (serial_number);


--
-- Name: equipment_status_types equipment_status_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_status_types
    ADD CONSTRAINT equipment_status_types_pkey PRIMARY KEY (status_id);


--
-- Name: equipment_status_types equipment_status_types_status_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_status_types
    ADD CONSTRAINT equipment_status_types_status_name_key UNIQUE (status_name);


--
-- Name: equipment_tag_map equipment_tag_map_model_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_map
    ADD CONSTRAINT equipment_tag_map_model_id_tag_id_key UNIQUE (model_id, tag_id);


--
-- Name: equipment_tag_map equipment_tag_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_map
    ADD CONSTRAINT equipment_tag_map_pkey PRIMARY KEY (equipment_tag_map_id);


--
-- Name: equipment_tags equipment_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tags
    ADD CONSTRAINT equipment_tags_pkey PRIMARY KEY (tag_id);


--
-- Name: equipment_tags equipment_tags_tag_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tags
    ADD CONSTRAINT equipment_tags_tag_name_key UNIQUE (tag_name);


--
-- Name: faculties faculties_campus_id_faculty_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_campus_id_faculty_name_key UNIQUE (campus_id, faculty_name);


--
-- Name: faculties faculties_faculty_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_faculty_code_key UNIQUE (faculty_code);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (faculty_id);


--
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (instructor_id);


--
-- Name: instructors instructors_staff_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_staff_number_key UNIQUE (staff_number);


--
-- Name: instructors instructors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_user_id_key UNIQUE (user_id);


--
-- Name: kit_items kit_items_kit_id_model_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kit_items
    ADD CONSTRAINT kit_items_kit_id_model_id_key UNIQUE (kit_id, model_id);


--
-- Name: kit_items kit_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kit_items
    ADD CONSTRAINT kit_items_pkey PRIMARY KEY (kit_item_id);


--
-- Name: maintenance_records maintenance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_pkey PRIMARY KEY (maintenance_record_id);


--
-- Name: maintenance_schedules maintenance_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_schedules
    ADD CONSTRAINT maintenance_schedules_pkey PRIMARY KEY (schedule_id);


--
-- Name: notification_types notification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_pkey PRIMARY KEY (notification_type_id);


--
-- Name: notification_types notification_types_type_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_type_name_key UNIQUE (type_name);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: penalties penalties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalties
    ADD CONSTRAINT penalties_pkey PRIMARY KEY (penalty_id);


--
-- Name: penalty_types penalty_types_penalty_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalty_types
    ADD CONSTRAINT penalty_types_penalty_name_key UNIQUE (penalty_name);


--
-- Name: penalty_types penalty_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalty_types
    ADD CONSTRAINT penalty_types_pkey PRIMARY KEY (penalty_type_id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (program_id);


--
-- Name: programs programs_program_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_program_code_key UNIQUE (program_code);


--
-- Name: reservation_items reservation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_pkey PRIMARY KEY (reservation_item_id);


--
-- Name: reservation_policies reservation_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_policies
    ADD CONSTRAINT reservation_policies_pkey PRIMARY KEY (policy_id);


--
-- Name: reservation_purpose_types reservation_purpose_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_purpose_types
    ADD CONSTRAINT reservation_purpose_types_pkey PRIMARY KEY (purpose_type_id);


--
-- Name: reservation_purpose_types reservation_purpose_types_purpose_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_purpose_types
    ADD CONSTRAINT reservation_purpose_types_purpose_name_key UNIQUE (purpose_name);


--
-- Name: reservation_status_history reservation_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_history
    ADD CONSTRAINT reservation_status_history_pkey PRIMARY KEY (history_id);


--
-- Name: reservation_status_types reservation_status_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_types
    ADD CONSTRAINT reservation_status_types_pkey PRIMARY KEY (status_id);


--
-- Name: reservation_status_types reservation_status_types_status_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_types
    ADD CONSTRAINT reservation_status_types_status_name_key UNIQUE (status_name);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: return_records return_records_checkout_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_records
    ADD CONSTRAINT return_records_checkout_id_key UNIQUE (checkout_id);


--
-- Name: return_records return_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_records
    ADD CONSTRAINT return_records_pkey PRIMARY KEY (return_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: rooms rooms_building_id_room_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_building_id_room_code_key UNIQUE (building_id, room_code);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: staff_members staff_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_pkey PRIMARY KEY (staff_member_id);


--
-- Name: staff_members staff_members_staff_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_staff_number_key UNIQUE (staff_number);


--
-- Name: staff_members staff_members_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_user_id_key UNIQUE (user_id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- Name: students students_registration_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_registration_number_key UNIQUE (registration_number);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: user_certifications user_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_certifications
    ADD CONSTRAINT user_certifications_pkey PRIMARY KEY (user_certification_id);


--
-- Name: user_certifications user_certifications_user_id_certification_id_issued_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_certifications
    ADD CONSTRAINT user_certifications_user_id_certification_id_issued_date_key UNIQUE (user_id, certification_id, issued_date);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_role_id);


--
-- Name: user_roles user_roles_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- Name: violation_types violation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violation_types
    ADD CONSTRAINT violation_types_pkey PRIMARY KEY (violation_type_id);


--
-- Name: violation_types violation_types_violation_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violation_types
    ADD CONSTRAINT violation_types_violation_name_key UNIQUE (violation_name);


--
-- Name: violations violations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_pkey PRIMARY KEY (violation_id);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (waitlist_id);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_checkout_records_reservation_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_checkout_records_reservation_item ON public.checkout_records USING btree (reservation_item_id);


--
-- Name: idx_equipment_location_history_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_location_history_equipment_id ON public.equipment_location_history USING btree (equipment_id);


--
-- Name: idx_equipment_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_model_id ON public.equipment USING btree (model_id);


--
-- Name: idx_equipment_status_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_status_id ON public.equipment USING btree (status_id);


--
-- Name: idx_notifications_user_id_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id_is_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_reservation_items_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservation_items_equipment_id ON public.reservation_items USING btree (equipment_id);


--
-- Name: idx_reservation_items_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservation_items_model_id ON public.reservation_items USING btree (model_id);


--
-- Name: idx_reservation_items_reservation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservation_items_reservation_id ON public.reservation_items USING btree (reservation_id);


--
-- Name: idx_reservations_requested_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_requested_by ON public.reservations USING btree (requested_by_user_id);


--
-- Name: idx_reservations_status_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_status_id ON public.reservations USING btree (status_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: approvals approvals_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES public.users(user_id);


--
-- Name: approvals approvals_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id) ON DELETE CASCADE;


--
-- Name: attachments attachments_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(user_id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: blackout_periods blackout_periods_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blackout_periods
    ADD CONSTRAINT blackout_periods_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.equipment_categories(category_id);


--
-- Name: blackout_periods blackout_periods_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blackout_periods
    ADD CONSTRAINT blackout_periods_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: blackout_periods blackout_periods_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blackout_periods
    ADD CONSTRAINT blackout_periods_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: blackout_periods blackout_periods_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blackout_periods
    ADD CONSTRAINT blackout_periods_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);


--
-- Name: buildings buildings_campus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_campus_id_fkey FOREIGN KEY (campus_id) REFERENCES public.campuses(campus_id) ON DELETE CASCADE;


--
-- Name: checkout_records checkout_records_received_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_records
    ADD CONSTRAINT checkout_records_received_by_user_id_fkey FOREIGN KEY (received_by_user_id) REFERENCES public.users(user_id);


--
-- Name: checkout_records checkout_records_released_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_records
    ADD CONSTRAINT checkout_records_released_by_user_id_fkey FOREIGN KEY (released_by_user_id) REFERENCES public.users(user_id);


--
-- Name: checkout_records checkout_records_reservation_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkout_records
    ADD CONSTRAINT checkout_records_reservation_item_id_fkey FOREIGN KEY (reservation_item_id) REFERENCES public.reservation_items(reservation_item_id) ON DELETE CASCADE;


--
-- Name: condition_reports condition_reports_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_reports
    ADD CONSTRAINT condition_reports_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON DELETE CASCADE;


--
-- Name: condition_reports condition_reports_reported_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_reports
    ADD CONSTRAINT condition_reports_reported_by_user_id_fkey FOREIGN KEY (reported_by_user_id) REFERENCES public.users(user_id);


--
-- Name: condition_reports condition_reports_reservation_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condition_reports
    ADD CONSTRAINT condition_reports_reservation_item_id_fkey FOREIGN KEY (reservation_item_id) REFERENCES public.reservation_items(reservation_item_id);


--
-- Name: course_instructors course_instructors_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(instructor_id) ON DELETE CASCADE;


--
-- Name: course_instructors course_instructors_offering_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_offering_id_fkey FOREIGN KEY (offering_id) REFERENCES public.course_offerings(offering_id) ON DELETE CASCADE;


--
-- Name: course_offerings course_offerings_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- Name: course_offerings course_offerings_default_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_default_room_id_fkey FOREIGN KEY (default_room_id) REFERENCES public.rooms(room_id);


--
-- Name: course_offerings course_offerings_term_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_offerings
    ADD CONSTRAINT course_offerings_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.academic_terms(term_id);


--
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: departments departments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_offering_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_offering_id_fkey FOREIGN KEY (offering_id) REFERENCES public.course_offerings(offering_id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- Name: equipment_accessories equipment_accessories_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_accessories
    ADD CONSTRAINT equipment_accessories_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON DELETE CASCADE;


--
-- Name: equipment_categories equipment_categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_categories
    ADD CONSTRAINT equipment_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.equipment_categories(category_id);


--
-- Name: equipment_certification_requirements equipment_certification_requirements_certification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_certification_requirements
    ADD CONSTRAINT equipment_certification_requirements_certification_id_fkey FOREIGN KEY (certification_id) REFERENCES public.certification_types(certification_id) ON DELETE CASCADE;


--
-- Name: equipment_certification_requirements equipment_certification_requirements_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_certification_requirements
    ADD CONSTRAINT equipment_certification_requirements_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id) ON DELETE CASCADE;


--
-- Name: equipment equipment_current_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_current_room_id_fkey FOREIGN KEY (current_room_id) REFERENCES public.rooms(room_id);


--
-- Name: equipment_images equipment_images_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_images
    ADD CONSTRAINT equipment_images_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON DELETE CASCADE;


--
-- Name: equipment_images equipment_images_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_images
    ADD CONSTRAINT equipment_images_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id) ON DELETE CASCADE;


--
-- Name: equipment_images equipment_images_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_images
    ADD CONSTRAINT equipment_images_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(user_id);


--
-- Name: equipment_location_history equipment_location_history_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_location_history
    ADD CONSTRAINT equipment_location_history_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON DELETE CASCADE;


--
-- Name: equipment_location_history equipment_location_history_moved_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_location_history
    ADD CONSTRAINT equipment_location_history_moved_by_user_id_fkey FOREIGN KEY (moved_by_user_id) REFERENCES public.users(user_id);


--
-- Name: equipment_location_history equipment_location_history_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_location_history
    ADD CONSTRAINT equipment_location_history_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);


--
-- Name: equipment equipment_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id);


--
-- Name: equipment_models equipment_models_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_models
    ADD CONSTRAINT equipment_models_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.equipment_categories(category_id);


--
-- Name: equipment_models equipment_models_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_models
    ADD CONSTRAINT equipment_models_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: equipment equipment_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.equipment_status_types(status_id);


--
-- Name: equipment_tag_map equipment_tag_map_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_map
    ADD CONSTRAINT equipment_tag_map_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id) ON DELETE CASCADE;


--
-- Name: equipment_tag_map equipment_tag_map_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_tag_map
    ADD CONSTRAINT equipment_tag_map_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.equipment_tags(tag_id) ON DELETE CASCADE;


--
-- Name: faculties faculties_campus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_campus_id_fkey FOREIGN KEY (campus_id) REFERENCES public.campuses(campus_id);


--
-- Name: departments fk_departments_hod; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk_departments_hod FOREIGN KEY (head_of_department_user_id) REFERENCES public.users(user_id);


--
-- Name: faculties fk_faculties_dean; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT fk_faculties_dean FOREIGN KEY (dean_user_id) REFERENCES public.users(user_id);


--
-- Name: instructors instructors_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: instructors instructors_office_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_office_room_id_fkey FOREIGN KEY (office_room_id) REFERENCES public.rooms(room_id);


--
-- Name: instructors instructors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: kit_items kit_items_kit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kit_items
    ADD CONSTRAINT kit_items_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES public.equipment_kits(kit_id) ON DELETE CASCADE;


--
-- Name: kit_items kit_items_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kit_items
    ADD CONSTRAINT kit_items_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id);


--
-- Name: maintenance_records maintenance_records_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON DELETE CASCADE;


--
-- Name: maintenance_records maintenance_records_external_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_external_vendor_id_fkey FOREIGN KEY (external_vendor_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: maintenance_records maintenance_records_performed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_performed_by_user_id_fkey FOREIGN KEY (performed_by_user_id) REFERENCES public.users(user_id);


--
-- Name: maintenance_records maintenance_records_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.maintenance_schedules(schedule_id);


--
-- Name: maintenance_schedules maintenance_schedules_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_schedules
    ADD CONSTRAINT maintenance_schedules_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(notification_type_id);


--
-- Name: notifications notifications_related_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_reservation_id_fkey FOREIGN KEY (related_reservation_id) REFERENCES public.reservations(reservation_id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_paid_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_paid_by_user_id_fkey FOREIGN KEY (paid_by_user_id) REFERENCES public.users(user_id);


--
-- Name: payment_transactions payment_transactions_penalty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_penalty_id_fkey FOREIGN KEY (penalty_id) REFERENCES public.penalties(penalty_id) ON DELETE CASCADE;


--
-- Name: penalties penalties_penalty_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalties
    ADD CONSTRAINT penalties_penalty_type_id_fkey FOREIGN KEY (penalty_type_id) REFERENCES public.penalty_types(penalty_type_id);


--
-- Name: penalties penalties_violation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalties
    ADD CONSTRAINT penalties_violation_id_fkey FOREIGN KEY (violation_id) REFERENCES public.violations(violation_id) ON DELETE CASCADE;


--
-- Name: programs programs_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;


--
-- Name: reservation_items reservation_items_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id);


--
-- Name: reservation_items reservation_items_kit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES public.equipment_kits(kit_id);


--
-- Name: reservation_items reservation_items_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id);


--
-- Name: reservation_items reservation_items_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_items
    ADD CONSTRAINT reservation_items_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id) ON DELETE CASCADE;


--
-- Name: reservation_policies reservation_policies_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_policies
    ADD CONSTRAINT reservation_policies_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.equipment_categories(category_id);


--
-- Name: reservation_policies reservation_policies_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_policies
    ADD CONSTRAINT reservation_policies_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: reservation_status_history reservation_status_history_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_history
    ADD CONSTRAINT reservation_status_history_changed_by_user_id_fkey FOREIGN KEY (changed_by_user_id) REFERENCES public.users(user_id);


--
-- Name: reservation_status_history reservation_status_history_new_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_history
    ADD CONSTRAINT reservation_status_history_new_status_id_fkey FOREIGN KEY (new_status_id) REFERENCES public.reservation_status_types(status_id);


--
-- Name: reservation_status_history reservation_status_history_old_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_history
    ADD CONSTRAINT reservation_status_history_old_status_id_fkey FOREIGN KEY (old_status_id) REFERENCES public.reservation_status_types(status_id);


--
-- Name: reservation_status_history reservation_status_history_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_status_history
    ADD CONSTRAINT reservation_status_history_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id) ON DELETE CASCADE;


--
-- Name: reservations reservations_course_offering_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_course_offering_id_fkey FOREIGN KEY (course_offering_id) REFERENCES public.course_offerings(offering_id);


--
-- Name: reservations reservations_pickup_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pickup_room_id_fkey FOREIGN KEY (pickup_room_id) REFERENCES public.rooms(room_id);


--
-- Name: reservations reservations_purpose_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_purpose_type_id_fkey FOREIGN KEY (purpose_type_id) REFERENCES public.reservation_purpose_types(purpose_type_id);


--
-- Name: reservations reservations_requested_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_requested_by_user_id_fkey FOREIGN KEY (requested_by_user_id) REFERENCES public.users(user_id);


--
-- Name: reservations reservations_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.reservation_status_types(status_id);


--
-- Name: return_records return_records_checkout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_records
    ADD CONSTRAINT return_records_checkout_id_fkey FOREIGN KEY (checkout_id) REFERENCES public.checkout_records(checkout_id) ON DELETE CASCADE;


--
-- Name: return_records return_records_received_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_records
    ADD CONSTRAINT return_records_received_by_user_id_fkey FOREIGN KEY (received_by_user_id) REFERENCES public.users(user_id);


--
-- Name: return_records return_records_returned_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_records
    ADD CONSTRAINT return_records_returned_by_user_id_fkey FOREIGN KEY (returned_by_user_id) REFERENCES public.users(user_id);


--
-- Name: rooms rooms_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(building_id) ON DELETE CASCADE;


--
-- Name: staff_members staff_members_assigned_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_assigned_room_id_fkey FOREIGN KEY (assigned_room_id) REFERENCES public.rooms(room_id);


--
-- Name: staff_members staff_members_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: staff_members staff_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: students students_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(program_id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: system_settings system_settings_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: user_certifications user_certifications_certification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_certifications
    ADD CONSTRAINT user_certifications_certification_id_fkey FOREIGN KEY (certification_id) REFERENCES public.certification_types(certification_id);


--
-- Name: user_certifications user_certifications_issued_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_certifications
    ADD CONSTRAINT user_certifications_issued_by_user_id_fkey FOREIGN KEY (issued_by_user_id) REFERENCES public.users(user_id);


--
-- Name: user_certifications user_certifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_certifications
    ADD CONSTRAINT user_certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: users users_campus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_campus_id_fkey FOREIGN KEY (campus_id) REFERENCES public.campuses(campus_id);


--
-- Name: violations violations_recorded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_recorded_by_user_id_fkey FOREIGN KEY (recorded_by_user_id) REFERENCES public.users(user_id);


--
-- Name: violations violations_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id);


--
-- Name: violations violations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: violations violations_violation_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_violation_type_id_fkey FOREIGN KEY (violation_type_id) REFERENCES public.violation_types(violation_type_id);


--
-- Name: waitlist waitlist_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.equipment_models(model_id);


--
-- Name: waitlist waitlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TPM08vLb5hbnpIKDVcdTKx87Kz1jxVQp9Yuql5o8KC6BAHZxbTgCWdJqx1ezHVU

