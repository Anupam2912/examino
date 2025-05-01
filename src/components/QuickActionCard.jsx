import { Link } from 'react-router-dom';

export default function QuickActionCard({ 
  title, 
  icon, 
  bgColor, 
  hoverColor, 
  linkTo, 
  onClick, 
  disabled = false,
  tooltipText
}) {
  const cardClasses = `
    card flex flex-col items-center justify-center p-6 
    ${bgColor} ${disabled ? 'opacity-50 cursor-not-allowed' : `${hoverColor} cursor-pointer`}
    h-40 transition-all duration-200
  `;
  
  const CardContent = () => (
    <>
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
    </>
  );
  
  if (disabled) {
    return (
      <div className={cardClasses} title={tooltipText}>
        <CardContent />
      </div>
    );
  }
  
  if (onClick) {
    return (
      <div className={cardClasses} onClick={onClick}>
        <CardContent />
      </div>
    );
  }
  
  return (
    <Link to={linkTo} className={cardClasses}>
      <CardContent />
    </Link>
  );
}
