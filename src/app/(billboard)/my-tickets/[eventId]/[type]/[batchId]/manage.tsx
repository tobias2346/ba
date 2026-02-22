'use client'
import ManageList from './manage-list'
import ManageTicket from './manage-ticket'

const Manage = ({ type } :  { type : string}) => {
  if (type === "list") return <ManageList />
  if (type === "ticket") return <ManageTicket />

  return <div>Tipo inválido</div>
}

export default Manage
