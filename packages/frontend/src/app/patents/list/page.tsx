import NetworkSupportChecker from '~~/components/NetworkSupportChecker'
import PatentList from '~~/dapp/components/patent/list'

export default function PatentHome() {
  return (
    <>
      <NetworkSupportChecker />
      <div className="justify-content flex flex-grow flex-col items-center justify-center rounded-md p-3">
        <PatentList />
      </div>
    </>
  )
}
