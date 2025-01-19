const DURATION = 15000;
const ROWS = 2;
const TAGS_PER_ROW = 5;

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const shuffle = (arr) => [...arr].sort(() => .5 - Math.random());

const InfiniteLoopSlider = ({children, duration, reverse = false}) => {
    return (
        <div className='loop-slider' style={{
            '--duration': `${duration}ms`,
            '--direction': reverse ? 'reverse' : 'normal'
        }}>
            <div className='inner'>
                {children}
                {children}
            </div>
        </div>
    );
};

const Tag = ({ text, number }) => (
    <div className='tag'>
        {number ? <span>{number}</span> : <span>•</span>} {text}
    </div>
);

const STATS = [
    { number: '95%', text: 'Client Satisfaction' },
    { number: '20Y', text: 'Of Expertise' },
    { number: '24/7', text: 'Support Available' },
    { number: '100+', text: 'Daily Tests' },
    { number: '50+', text: 'Expert Staff' }
];

const FEATURES = [
    'Advanced Equipment',
    'Professional Care',
    'Fast Results',
    'Quality Service',
    'Modern Facilities'
];

const App = () => (
    <div className='tag-list'>
        <InfiniteLoopSlider duration={random(DURATION - 5000, DURATION + 5000)} reverse={false}>
            {STATS.map(stat => (
                <Tag key={stat.text} text={stat.text} number={stat.number} />
            ))}
        </InfiniteLoopSlider>
        <InfiniteLoopSlider duration={random(DURATION - 5000, DURATION + 5000)} reverse={true}>
            {FEATURES.map(feature => (
                <Tag key={feature} text={feature} />
            ))}
        </InfiniteLoopSlider>
        <div className='fade'/>
    </div>
);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.tag-list');
    if (container) {
        ReactDOM.render(<App/>, container);
    }
}); 