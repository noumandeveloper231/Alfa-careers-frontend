import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Select from './Select';

const AVAILABLE_SKILLS = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase', 'SQL Server',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Agile', 'Scrum',
    'UI/UX Design', 'Figma Design', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Content Editor', 'Technical Writing', 'Product Manager', 'Communication Skills',
    'BackEnd Developer', 'FrontEnd Developer', 'Full Stack Developer', 'DevOps',
    'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning',
    'Mobile Development', 'iOS Development', 'Android Development', 'React Native', 'Flutter',
    'Testing', 'Unit Testing', 'Integration Testing', 'QA', 'Selenium', 'Jest',
    'Documentation', 'API Development', 'REST API', 'GraphQL', 'Microservices',
    'Problem Solving', 'Team Leadership', 'Project Management', 'Critical Thinking'
];

const SkillsSelector = ({ selectedSkills, onSkillsChange }) => {
    const { backendUrl } = useContext(AppContext);
    const [availableSkills, setAvailableSkills] = useState(AVAILABLE_SKILLS);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/skills`);
                if (data.success) {
                    setAvailableSkills(data.skills.map(s => s.name));
                }
            } catch {
                /* ignore error, fallback to default */
            }
        };
        fetchSkills();
    }, [backendUrl]);

    const skillOptions = availableSkills.map(s => ({ value: s, label: s }));
    const selectedValues = selectedSkills.map(s => ({ value: s, label: s }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm block mb-2 font-medium text-gray-700">Skills</label>
                <Select
                    options={skillOptions}
                    value={selectedValues}
                    onChange={(options) => onSkillsChange(options ? options.map(o => o.value) : [])}
                    isMulti
                    isSearchable
                    placeholder="Search and select skills..."
                />
            </div>
            <p className="text-xs text-gray-500">
                Search and select your skills from the list.
            </p>
        </div>
    );
};

export default SkillsSelector;
