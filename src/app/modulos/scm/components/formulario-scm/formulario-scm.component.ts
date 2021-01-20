import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PerfilService } from "app/modulos/admin/services/perfil.service";
import { UsuarioService } from "app/modulos/admin/services/usuario.service";
import { Afp } from "app/modulos/comun/entities/afp";
import { Eps } from "app/modulos/comun/entities/eps";
import { ComunService } from "app/modulos/comun/services/comun.service";
import { EnumeracionesService } from "app/modulos/comun/services/enumeraciones.service";
import { Criteria } from "app/modulos/core/entities/filter";
import { FilterQuery } from "app/modulos/core/entities/filter-query";
import { SesionService } from "app/modulos/core/services/sesion.service";
import { Cargo } from "app/modulos/empresa/entities/cargo";
import { Empleado } from "app/modulos/empresa/entities/empleado";
import { Perfil } from "app/modulos/empresa/entities/perfil";
import { CargoService } from "app/modulos/empresa/services/cargo.service";
import { EmpleadoService } from "app/modulos/empresa/services/empleado.service";
import {
    locale_es,
    tipo_identificacion,
    tipo_vinculacion,
} from "app/modulos/rai/enumeraciones/reporte-enumeraciones";
import { SelectItem, Message } from "primeng/api";
import { CasosMedicosService } from "../../services/casos-medicos.service";
import * as moment from "moment";
import { Router, RouterLink } from "@angular/router";
import { AutoComplete } from "primeng/primeng";
import { UsuarioEmpresa } from "app/modulos/empresa/entities/usuario-empresa";
import { ReporteAusentismoService } from "app/modulos/aus/services/reporte-ausentismo.service";

@Component({
    selector: "app-formulario-scm",
    templateUrl: "./formulario-scm.component.html",
    styleUrls: ["./formulario-scm.component.scss"],
})
export class FormularioScmComponent implements OnInit {
    value;
    msgs: Message[];
    edad;
    incapacidades = [];
    modalRecomendatios = false;
    casoMedicoForm: FormGroup;
    bussinessParner: FormGroup;
    jefeInmediato: FormGroup;
    cedula = "TANGAMANDAPIO";
    cargoDescripcion: string;
    actualizar: boolean;
    adicionar: boolean;
    empleado: Empleado;
    recomendationList = [];
    logsList = []
    empleadosList: Empleado[];
    @Input() empleadoSelect: Empleado;
    @Output() onEmpleadoUpdate = new EventEmitter();
    @Output() onCancel = new EventEmitter();
    @Input() caseSelect: any;
    @Input() isUpdate: boolean;
    @Input() show: boolean;
    @Input() consultar: boolean = false;;

    @Input() editable: boolean;
    @ViewChild("autocomplete", { static: true }) autoC: ElementRef;
    rangoAntiguedad = [
        { label: "Entre 1 y 5 años", range: "1,2,3,4,5" },
        { label: "Entre 6 y 10 años", range: "6,7,8,9,10" },
        { label: "Entre 11 y 15 años", range: "11,12,13,14,15" },
        { label: "Entre 16 y 20 años", range: "16,17,18,19,20" },
        { label: "Mayor a 20", range: "21,22,23,24,25,26,27,28,29" },
    ]
    empleadoForm: FormGroup;
    empresaId = this.sesionService.getEmpresa().id;
    fechaActual = new Date();
    logSelected;
    yearRange: string = "1900:" + this.fechaActual.getFullYear();
    localeES: any = locale_es;
    tipoIdentificacionList: SelectItem[];
    tipoVinculacionList: SelectItem[];
    epsList: SelectItem[];
    afpList: SelectItem[];
    cargoList: SelectItem[];
    caseStatus = [
        { label: "Select City", value: null },
        { label: "Abierto", value: 1 },
        { label: "Cerrado", value: 0 },
    ];
    perfilList: SelectItem[] = [];
    loaded: boolean;
    antiguedad;
    range;
    solicitando: boolean = false;
    departamento;


    constructor(
        private empleadoService: EmpleadoService,
        private fb: FormBuilder,
        private sesionService: SesionService,
        private enumeracionesService: EnumeracionesService,
        private comunService: ComunService,
        private cargoService: CargoService,
        private usuarioService: UsuarioService,
        private scmService: CasosMedicosService,
        private perfilService: PerfilService,
        private router: Router,) {

        let defaultItem = <SelectItem[]>[{ label: "--seleccione--", value: null }];
        this.tipoIdentificacionList = defaultItem.concat(
            <SelectItem[]>tipo_identificacion
        );

        this.tipoVinculacionList = defaultItem.concat(
            <SelectItem[]>tipo_vinculacion
        );


        //Instaciacion de datos de form
        this.bussinessParner = fb.group({
            id: ["", Validators.required],
            numeroIdentificacion: ["", Validators.required],
            primerNombre: [{ value: "", disabled: true }, Validators.required],
            segundoNombre: { value: "", disabled: true },
            email: { value: "", disabled: true },
            corporativePhone: [{ value: "", disabled: true }],
            cargoId: [{ value: "", disabled: true }, Validators.required],
        });
        this.jefeInmediato = fb.group({
            id: ["", Validators.required],
            numeroIdentificacion: ["", Validators.required],
            primerNombre: [{ value: "", disabled: true }, Validators.required],
            segundoNombre: { value: "", disabled: true },
            email: { value: "", disabled: true },
            corporativePhone: [{ value: "", disabled: true }],
            cargoId: [{ value: "", disabled: true }, Validators.required],
        });
        this.empleadoForm = fb.group({
            id: [null],
            primerNombre: [{ value: "", disabled: true }, Validators.required],
            segundoNombre: null,
            primerApellido: [null, Validators.required],
            segundoApellido: null,
            codigo: [null],
            direccion: [null],
            fechaIngreso: [{ value: null, disabled: true }, Validators.required],
            fechaNacimiento: [null],
            genero: [{ value: null, disabled: true }, Validators.required],
            numeroIdentificacion: ["", Validators.required],
            telefono1: [null],
            telefono2: [null],
            corporativePhone: [null],
            emergencyContact: [null],
            phoneEmergencyContact: [null],
            emailEmergencyContact: [null],
            afp: [null],
            ccf: [null],
            ciudad: [null],
            eps: [null],
            tipoIdentificacion: [{ value: null, disabled: true }, Validators.required],
            tipoVinculacion: [null],
            zonaResidencia: [null],
            area: [null, Validators.required],
            cargoId: [null, Validators.required],
            perfilesId: [null, Validators.required],
            //'ipPermitida': [null],
            email: [null, { disabled: true }, Validators.required],
        });

        this.casoMedicoForm = fb.group({
            id: [null],
            documento: [null],
            codigoCie10: [null, Validators.required],
            razon: [null, Validators.required],
            names: [null, Validators.required],
            observaciones: [null, Validators.required],
            statusCaso: [null, Validators.required],
            requiereIntervencion: [null, Validators.required],
            professionalArea: [null, Validators.required],
            pkJefe: [null, Validators.required],
            porcentajePcl: [null, Validators.required],
            pcl: [null, Validators.required],
            region: [null],
            ciudad: [null],
            cargo: [null],
            descripcionCompletaCaso: [null, Validators.required],
            fechaCalificacion: [null, Validators.required],
            sve: [null, Validators.required],
            pkUser: [null, Validators.required],
            diagnostico: [null, Validators.required],
            origen: [null, Validators.required],
            fechaConceptRehabilitacion: [null, Validators.required],
            entidadEmiteConcepto: [null, Validators.required],
            justification: [null, Validators.required],
            statusDeCalificacion: [null, Validators.required],
            casoMedicoLaboral: [null, Validators.required],
            fechaFinal: [null, Validators.required],
            emisionPclFecha: [null, Validators.required],
            sistemaAfectado: [null, Validators.required],
            fechaCreacion: [null],

            entidadEmiteCalificacion: [null, Validators.required],
            pkBusinessPartner: [null, Validators.required],
            pclEmitEntidad: [null, Validators.required],
            conceptRehabilitacion: [null, Validators.required],
        });
    }

    async ngOnInit() {
        if (this.consultar) {
            this.empleadoForm.disable();
            this.bussinessParner.disable();
            this.casoMedicoForm.disable();
            this.empleadoForm.disable();
        }
        if (this.caseSelect) {
            console.log(this.caseSelect);
            this.recomendationList = await this.scmService.getRecomendations(this.caseSelect.documento);
            this.logsList = await this.scmService.getLogs(this.caseSelect.pkUser);
            this.casoMedicoForm.patchValue(this.caseSelect);
            this.isUpdate ? this.empleadoForm.controls["email"].disable() : ""; //this for disabled email in case of update
            if (this.caseSelect != null) {
                // console.log("tiene data");
                let fq = new FilterQuery();
                fq.filterList = [
                    {
                        criteria: Criteria.EQUALS,
                        field: "id",
                        value1: this.caseSelect.pkUser,
                        value2: null,
                    },
                ];
                // //console.log(fq);
                this.empleadoService.findByFilter(fq).then((resp) => {
                    let select = <Empleado>resp["data"][0];
                    this.onSelection(select);
                });
                fq.filterList = [
                    {
                        criteria: Criteria.EQUALS,
                        field: "id",
                        value1: this.caseSelect.pkJefe,
                        value2: null,
                    },
                ];
                // //console.log(fq);
                this.empleadoService.findByFilter(fq).then((resp) => {
                    let select = <Empleado>resp["data"][0];
                    this.onSelectionBP(select);
                });
                fq.filterList = [
                    {
                        criteria: Criteria.EQUALS,
                        field: "id",
                        value1: this.caseSelect.pkBusinessPartner,
                        value2: null,
                    },
                ];
                this.incapacidades = await this.scmService.ausentismos(this.caseSelect.pkUser);
                console.log(this.incapacidades);
                // //console.log(fq);
                this.empleadoService.findByFilter(fq).then((resp) => {
                    let select = <Empleado>resp["data"][0];
                    this.onSelectionJI(select);
                });


            } else {
                this.loaded = true;
                let area: any;
                //console.log("new register");
                this.empleadoForm.patchValue({ area: area });
                this.editable = true;
            }
        }
        this.comunService.findAllAfp().then((data) => {
            this.afpList = [];
            this.afpList.push({ label: "--Seleccione--", value: null });
            (<Afp[]>data).forEach((afp) => {
                this.afpList.push({ label: afp.nombre, value: afp.id });
            });
        });
        this.comunService.findAllEps().then((data) => {
            this.epsList = [];
            this.epsList.push({ label: "--Seleccione--", value: null });
            (<Eps[]>data).forEach((eps) => {
                this.epsList.push({ label: eps.nombre, value: eps.id });
            });
        });

        this.cargoService.findAll().then((resp) => {
            this.cargoList = [];
            this.cargoList.push({ label: "--Seleccione--", value: null });
            (<Cargo[]>resp["data"]).forEach((cargo) => {
                this.cargoList.push({ label: cargo.nombre, value: cargo.id });
            });
            //this.cargoList = this.cargoList.slice();
        });
        this.perfilService.findAll().then((resp) => {
            (<Perfil[]>resp["data"]).forEach((perfil) => {
                this.perfilList.push({ label: perfil.nombre, value: perfil.id });
            });
            if (this.isUpdate === true || this.show === true)
                setTimeout(() => {
                    this.buildPerfilesIdList();
                }, 500);
        });
    }
    closeForm() {
        this.onCancel.emit();
    }
    async onSubmit() {
        this.casoMedicoForm.patchValue({
            region: this.empleadoForm.get("area").value.nombre,
            ciudad: this.empleadoForm.get("ciudad").value.nombre,
            // statusCaso: this.casoMedicoForm.get('statusCaso').value,
            names: `${this.jefeInmediato.value.primerNombre} ${this.jefeInmediato.value.segundoApellido || ""
                }`,
            cargo: this.empleadoForm.value.cargoId,
            // cargo:  this.cargoList.find(cargos => cargos.value =this.empleadoForm.get('cargoId').value),
            pkJefe: this.jefeInmediato.value.id || null,
            pkBusinessPartner: this.bussinessParner.get("id").value || null,
            pkUser: this.empleadoForm.get("id").value || null,
            codigoCie10: this.casoMedicoForm.value.id || null,
        });

        console.log(
            this.jefeInmediato.value,
            this.empleadoForm.value,
            this.casoMedicoForm.value,
            this.bussinessParner.value
        );

        let { email, cargoId, perfilesId, ...empledo } = this.empleadoForm.value;
        empledo.cargo = new Cargo();
        empledo.cargo.id = cargoId;

        if (this.empleadoForm.value.afp != null) {
            empledo.afp = new Afp();
            empledo.afp.id = this.empleadoForm.value.afp;
        }
        if (this.empleadoForm.value.eps != null) {
            empledo.eps = new Eps();
            empledo.eps.id = this.empleadoForm.value.eps;
        }
        console.log(empledo, this.empleadoSelect);
        let status;
        if (!this.caseSelect) {
            this.casoMedicoForm.patchValue({ fechaCreacion: Date.now() });
            let empleadoStatus = await this.empleadoService.update(empledo);
            console.log(empleadoStatus);
            status = await this.scmService.create(this.casoMedicoForm.value);
        } else {
            console.log(this.caseSelect);
            let empleadoStatus = await this.empleadoService.update(empledo);
            console.log(empleadoStatus);
            this.casoMedicoForm.patchValue({ id: this.caseSelect.id });
            status = await this.scmService.edit(this.casoMedicoForm.value);
        }

        if (status) {
            this.msgs = [];
            this.msgs.push({
                severity: "success",
                summary: "Caso medico creado",
                detail: `Su numero de caso es ${status}`,
            });
            setTimeout((res) => {
                this.closeForm();
                this.router.navigate(["/app/scm/list"]);
                this.router.navigateByUrl("/app/scm/list");
            }, 3000);
        }
    }

    async buildPerfilesIdList() {
        ////console.log(this.empleadoSelect.id, "181");
        let filterQuery = new FilterQuery();
        filterQuery.filterList = [
            {
                field: "usuarioEmpresaList.usuario.id",
                criteria: Criteria.EQUALS,
                value1: this.empleadoSelect.usuario.id,
                value2: null,
            },
        ];
        this.perfilService.update;
        await this.perfilService.findByFilter(filterQuery).then((resp) => {
            let perfilesId = [];
            resp["data"].forEach((ident) => perfilesId.push(ident.id));

            console.log(resp["data"]);
            this.empleadoForm.patchValue({ perfilesId: perfilesId });
        });
    }

    // Component methods
    buscarEmpleado(event) {
        this.empleadoService
            .buscar(event.query)
            .then((data) => (this.empleadosList = <Empleado[]>data));
    }

    async onSelection(event) {
        this.value = event;
        let emp = <Empleado>this.value;
        let validate;
        console.log();
        if (!this.caseSelect) {


            try {
                validate = await this.scmService.validate(emp.numeroIdentificacion);
                console.log(validate);
            } catch (error) { console.log("lolsito"); }


            this.msgs = [];
            if (!validate) {
                this.msgs.push({
                    severity: "error",
                    summary: "Ya existe un caso medico",
                    detail: `de el usuario ${emp.numeroIdentificacion}`,
                });
                this.empleadoForm.patchValue({ numeroIdentificacion: null });
                this.antiguedad = ""; this.cargoDescripcion = "";
                this.empleadoForm.reset();
                console.log(this.autoC);
                return;
            }
        }
        this.empleadoSelect = emp;
        this.loaded = true;

        let fecha = moment(this.empleadoSelect.fechaIngreso);
        let fechaNacimiento = moment(this.empleadoSelect.fechaNacimiento);
        let antigueMoment = fecha.diff(moment.now(), "years") * -1;
        this.antiguedad = ` ${antigueMoment} Años`;
        if (antigueMoment === 0) {
            this.range = 'Menor a 1 año'
        }

        for (let j = 0; j < this.rangoAntiguedad.length; j++) {
            let subArray = this.rangoAntiguedad[j].range.split(',')
            let a = subArray.find(range => range === antigueMoment.toString())

            if (a) {
                this.range = this.rangoAntiguedad[j].label;
            }

        }
        this.edad = `${fechaNacimiento.diff(moment.now(), "year") * -1}`;
        this.cargoDescripcion = this.empleadoSelect.cargo.descripcion;
        this.casoMedicoForm.patchValue({
            documento: this.empleadoSelect.numeroIdentificacion,
        });
        this.departamento = this.empleadoSelect.area.id;
        this.empleadoForm.patchValue({
            id: this.empleadoSelect.id,
            primerNombre: this.empleadoSelect.primerNombre,
            segundoNombre: this.empleadoSelect.segundoNombre,
            primerApellido: this.empleadoSelect.primerApellido,
            segundoApellido: this.empleadoSelect.segundoApellido,
            codigo: this.empleadoSelect.codigo,
            direccion: this.empleadoSelect.direccion,
            fechaIngreso:
                this.empleadoSelect.fechaIngreso == null
                    ? null
                    : new Date(this.empleadoSelect.fechaIngreso),
            fechaNacimiento:
                this.empleadoSelect.fechaNacimiento == null
                    ? null
                    : new Date(this.empleadoSelect.fechaNacimiento),
            genero: this.empleadoSelect.genero,
            numeroIdentificacion: this.empleadoSelect.numeroIdentificacion,
            telefono1: this.empleadoSelect.telefono1,
            telefono2: this.empleadoSelect.telefono2,
            corporativePhone: this.empleadoSelect.corporativePhone,
            afp: this.empleadoSelect.afp == null ? null : this.empleadoSelect.afp.id,
            ciudad: this.empleadoSelect.ciudad,
            eps: this.empleadoSelect.eps == null ? null : this.empleadoSelect.eps.id,
            tipoIdentificacion:
                this.empleadoSelect.tipoIdentificacion == null
                    ? null
                    : this.empleadoSelect.tipoIdentificacion.nombre,
            tipoVinculacion: this.empleadoSelect.tipoVinculacion,
            zonaResidencia: this.empleadoSelect.zonaResidencia,
            area: this.empleadoSelect.area,
            cargoId: this.empleadoSelect.cargo.id,
            perfilesId: [4],
            //'ipPermitida': this.empleadoSelect.usuario.ipPermitida,

            email: [this.empleadoSelect.usuario.email],
        });
        console.log(this.empleadoForm.value);
    }

    onClick() {
        this.router.navigate(["/app/scm/list"]);
        this.router.navigateByUrl("/app/scm/list");
    }
    onSelectionBP(event) {
        this.empleadoSelect = <Empleado>event;
        this.bussinessParner.patchValue({
            id: this.empleadoSelect.id,
            primerNombre: this.empleadoSelect.primerNombre,
            segundoNombre: this.empleadoSelect.segundoNombre,
            numeroIdentificacion: this.empleadoSelect.numeroIdentificacion,
            corporativePhone: this.empleadoSelect.corporativePhone,
            area: this.empleadoSelect.area,
            cargoId: this.empleadoSelect.cargo.id,
            //'ipPermitida': this.empleadoSelect.usuario.ipPermitida,

            email: [this.empleadoSelect.usuario.email],
        });
    }

    async onCloseModalrecomendation() {
        this.recomendationList = await this.scmService.getRecomendations(this.caseSelect.documento);

        this.modalRecomendatios = false;
    }
    onSelectionJI(event) {
        this.empleadoSelect = <Empleado>event;
        this.jefeInmediato.patchValue({
            id: this.empleadoSelect.id,
            primerNombre: this.empleadoSelect.primerNombre,
            segundoNombre: this.empleadoSelect.segundoNombre,
            numeroIdentificacion: this.empleadoSelect.numeroIdentificacion,
            corporativePhone: this.empleadoSelect.corporativePhone,
            area: this.empleadoSelect.area,
            cargoId: this.empleadoSelect.cargo.id,
            //'ipPermitida': this.empleadoSelect.usuario.ipPermitida,

            email: [this.empleadoSelect.usuario.email],
        });
    }
}
