import React from "react"
import {connect} from "react-redux";
 class Dashboard extends  React.Component{
 render(){
     return(
         <h2 className="page-heading">Информационная панель</h2>
     )
 }
}
export default connect()(Dashboard);
