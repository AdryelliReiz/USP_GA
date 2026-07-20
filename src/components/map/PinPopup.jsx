import RiskBadge from '../ui/RiskBadge.jsx'

export default function PinPopup({ unidade, onClose }) {
  if (!unidade) return null
  return (
    <div className="pin-popup" role="dialog" aria-label={`Detalhes da unidade ${unidade.nome}`}>
      <button className="pin-popup__close" onClick={onClose} aria-label="Fechar detalhes da unidade">×</button>
      <span className="pin-popup__tag">{unidade.tipo}</span>
      <h4 className="pin-popup__title">{unidade.nome}</h4>

      <dl className="pin-popup__list">
        <div>
          <dt>Endereço</dt>
          <dd>{unidade.endereco}</dd>
        </div>
        <div>
          <dt>Serviços oferecidos</dt>
          <dd>{unidade.servicos}</dd>
        </div>
        <div>
          <dt>Horário de funcionamento</dt>
          <dd>{unidade.horario}</dd>
        </div>
        <div>
          <dt>Riscos ambientais</dt>
          <dd>
            {unidade.riscos.length ? unidade.riscos.join(' + ') : 'Nenhum risco identificado'}
            {' '}
            {unidade.nivelRisco ? <RiskBadge level={unidade.nivelRisco} /> : <span className="badge">Não avaliado</span>}
          </dd>
        </div>
      </dl>
    </div>
  )
}
