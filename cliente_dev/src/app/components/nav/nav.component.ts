import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBA';
import { GuestService } from 'src/app/services/guest.service';
import { io } from "socket.io-client";
declare var $:any;
declare var iziToast:any;
declare function stickyHeader():any;


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public geo : any = {};
  public country = '';
  public currency = 'PEN';
  public token = localStorage.getItem('token')

  
  public categorias :Array<any> = [];
  public user : any = undefined;
  public user_lc : any = undefined;  

  public carrito_arr : Array<any> = [];
  public carrito_logout :Array<any> = [];
  public url = GLOBAL.url;
  public subtotal = 0;
  public filtro_search = ''
  public socket = io(GLOBAL.socket);
  public config: any = {};
  public empresa:any = {};
  public imgSelect: any | ArrayBuffer;
  public descuento_activo:any = undefined;

  constructor(
    private _guestService:GuestService,
    private _router:Router
  ) { 
    
    setTimeout(() => {
      stickyHeader();
    }, 50);
   
    let lc_geo :any= localStorage.getItem('geo');
    this.geo = JSON.parse(lc_geo);
    this.country = this.geo.country_name;
    this.currency = this.geo.currency;
    this.url = GLOBAL.url;
    

    if(this.token){
      let obj_lc :any= localStorage.getItem('user_data');
      this.user_lc = JSON.parse(obj_lc);
      console.log(this.user_lc);
      this.obtener_carrito();

    }

    if(this.user_lc == undefined){
      let ls_cart = localStorage.getItem('cart');
      if(ls_cart != null){
        this.carrito_logout = JSON.parse(ls_cart);
        this.calcular_carrito();
      }else{
        this.carrito_logout = [];
      }
    }

    this._guestService.listar_logo_categoria_publico().subscribe(
      response=>{
        this.empresa = response.data;
        // this.imgSelect = this.url+'obtener_logo/'+this.empresa.logo;
        // console.log(this.empresa.logo);
        // this._guestService.obtener_logo(this.empresa.logo).subscribe(
        //   response=>{
        //     console.log('aqui obtengo el logo');
        //     console.log(response);
        //   }
        // )
        
      }
    );


    

  }

  ngOnInit(): void {
    this.socket.on('new-carrito-add',(data)=>{
      if(this.user_lc == undefined){
        let ls_cart = localStorage.getItem('cart');
        if(ls_cart != null){
          this.carrito_logout = JSON.parse(ls_cart);
          this.calcular_carrito();
        }else{
          this.carrito_logout = [];
        }
        
      }else{
        this.obtener_carrito();
      }
      
    });

    this._guestService.obtener_config_admin().subscribe(
      response=>{
        this.config = response.data;
        this.imgSelect = this.url+'obtener_logo/'+this.config.logo;
        // console.log(this.config);
        
      }
    );

    
     
    
    this._guestService.listar_categorias_publico().subscribe(
      response=>{
              
        this.categorias = response.data;

      }
    );


    this._guestService.obtener_descuento_activo().subscribe(
      response=>{
        if (response.data != undefined) {
          this.descuento_activo = response.data[0];
        }else{
          this.descuento_activo = undefined;
        }
        
        console.log(this.descuento_activo);
        this.calcular_carrito()
      }
    )
  }

  search(){
    if(this.filtro_search){
      this._router.navigate(['/productos/'], { queryParams: { filter: this.filtro_search } });
      
    }
  }

  openCart(){
    var clase = $('#modalCarrito').attr('class');
    
    if(clase == 'ps-panel--sidebar'){
      $('#modalCarrito').addClass('active');
    }else if(clase == 'ps-panel--sidebar active'){
      $('#modalCarrito').removeClass('active');
    }
  }

  openMenu(){

    var clase = $('#modalMenu').attr('class');
    
    if(clase == 'ps-panel--sidebar'){
      $('#modalMenu').addClass('active');
    }else if(clase == 'ps-panel--sidebar active'){
      $('#modalMenu').removeClass('active');
    }

    

  }

  // openMenu() {
  //   const modalMenu = document.getElementById('modalMenu');
  //   if (modalMenu) {
  //     if (modalMenu.classList.contains('ps-panel--sidebar')) {
  //       modalMenu.classList.add('active');
  //     } else if (modalMenu.classList.contains('ps-panel--sidebar active')) {
  //       modalMenu.classList.remove('active');
  //     }
  //   }
  
    
  // }
  

  calcular_carrito(){
    this.subtotal = 0;
    if(this.user_lc != undefined){
      if(this.descuento_activo != undefined){
        if(this.currency == 'PEN'){
          this.carrito_arr.forEach(element => {
            let sub_precio = Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100) * element.cantidad;
            this.subtotal = this.subtotal + sub_precio;
            console.log(sub_precio);
            console.log(this.subtotal);
          });
        }else{
          this.carrito_arr.forEach(element => {
            let sub_precio = Math.round(parseInt(element.producto.precio_dolar) - (parseInt(element.producto.precio_dolar)*this.descuento_activo.descuento)/100) * element.cantidad;
            this.subtotal = this.subtotal + sub_precio;
            console.log(this.subtotal);
            // let sub_precio = parseInt(element.producto.precio_dolar) * element.cantidad;
            // this.subtotal = this.subtotal + sub_precio;
        });
        }
      }else{
        if(this.currency == 'PEN'){
          this.carrito_arr.forEach(element => {
              let sub_precio = parseInt(element.producto.precio) * element.cantidad;
              this.subtotal = this.subtotal + sub_precio;
          });
        }else{
          this.carrito_arr.forEach(element => {
            let sub_precio = parseInt(element.producto.precio_dolar) * element.cantidad;
            this.subtotal = this.subtotal + sub_precio;
        });
        }
      }

      
    }else if(this.user_lc == undefined){

      if(this.descuento_activo != undefined){
        if(this.currency == 'PEN'){
          this.carrito_arr.forEach(element => {
            let sub_precio = Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100);
            this.subtotal = this.subtotal + sub_precio;
            
          });
        }else{
          this.carrito_arr.forEach(element => {
            let sub_precio = Math.round(parseInt(element.producto.precio_dolar) - (parseInt(element.producto.precio_dolar)*this.descuento_activo.descuento)/100);
            this.subtotal = this.subtotal + sub_precio;
            // let sub_precio = parseInt(element.producto.precio_dolar) * element.cantidad;
            // this.subtotal = this.subtotal + sub_precio;
        });
        }

      }else{
        if(this.currency == 'PEN'){
          this.carrito_arr.forEach(element => {
              let sub_precio = parseInt(element.producto.precio) * element.cantidad;
              this.subtotal = this.subtotal + sub_precio;
          });
        }else{
          this.carrito_arr.forEach(element => {
            let sub_precio = parseInt(element.producto.precio_dolar) * element.cantidad;
            this.subtotal = this.subtotal + sub_precio;
        });
        } 

      }

      //aqui calculo el carrito del local storage
      
        if(this.currency == 'PEN'){
          this.carrito_logout.forEach(element => {
            let sub_precio = parseInt(element.producto.precio) * element.cantidad;
              this.subtotal = this.subtotal + sub_precio;
          });
        }else{
          this.carrito_logout.forEach(element => {
            let sub_precio = parseInt(element.producto.precio_dolar) * element.cantidad;
              this.subtotal = this.subtotal + sub_precio;
          });
        }
      
    }
  }

  logout(){
    window.location.reload();
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    localStorage.removeItem('user_data');
    this._router.navigate(['/']).then(() => {
      window.location.reload();
    });;
  }

  obtener_carrito(){
    this._guestService.obtener_carrito_cliente(this.user_lc._id,this.token).subscribe(
      response=>{
        this.carrito_arr = response.data;
        this.calcular_carrito();
      }
    );
  }

  eliminar_item_guest(item:any){
    this.carrito_logout.splice(item._id,1);
    localStorage.removeItem('cart');
    if(this.carrito_logout.length >= 1){
      localStorage.setItem('cart',JSON.stringify(this.carrito_logout));
    }
    if(this.currency == 'PEN'){
      let monto = item.producto.precio*item.cantidad;
      this.subtotal = this.subtotal -monto;
    } else if(this.currency != 'PEN'){
      let monto = item.producto.precio_dolar*item.cantidad;
      this.subtotal = this.subtotal -monto;
    }
  }

  eliminar_item(id:any){
    this._guestService.eliminar_carrito_cliente(id,this.token).subscribe(
      response=>{
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se eliminó el producto correctamente.'
        });
        this.obtener_carrito();
        this.socket.emit('delete-carrito',{data:response.data});
      }
    );
  }
}
