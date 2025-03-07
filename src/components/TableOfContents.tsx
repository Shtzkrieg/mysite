import { Component, createSignal } from 'solid-js';
import '../styles/toc.css';

// Table of Contents component
// This component will be used to display the side bar on the left of the page
// It will be used to scroll to the different sections of the page

type TOCProps = {
  sections: { id: string; title: string }[];
};

const TableOfContents: Component<TOCProps> = (props) => {
  const [activeSection, setActiveSection] = createSignal();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <nav class="toc">
      <h2 class="toc-title">Contents</h2>
      <ul class="toc-list">
        {props.sections.map((section) => (
          <li class="toc-item">
            <button
              onClick={() => scrollToSection(section.id)}
              class={`toc-link ${activeSection() === section.id ? 'active' : ''}`}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;