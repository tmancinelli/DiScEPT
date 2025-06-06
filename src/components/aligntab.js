import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import data from "../Data.js";
import CETEIHelper from "../CETEIHelper.js";

/**
 * AlignTab component provides a user interface for selecting a language,
 * displaying language-specific content, and enabling user interactions
 * with TEI (Text Encoding Initiative) elements.
 */
class AlignTab extends React.Component {
  constructor(props) {
    super(props);

    // Initial state includes selected language and refresh tracking.
    // If a language is provided via props, use it so that the selection is
    // preserved when the component is remounted.
    this.state = { language: props.language || "", lastRefresh: 0 };
    // Reference to content container for dynamic updates
    this.contentRef = React.createRef();
  }

  /**
   * Refreshes the content based on the selected language.
   * Clears existing content and re-generates it using CETEIHelper, with
   * alignment logic applied to TEI elements.
   */
  refresh(language) {
    if (!this.contentRef.current) return;

    const alignLogic = (rootElm, domElm, teiElm) => {
      domElm.addEventListener("click", (e) => {
        this.props.onSelectionChanged(domElm, teiElm, rootElm);
        e.stopPropagation();
      });

      domElm.addEventListener("mouseover", (e) => {
        if (!e.target.classList.contains("selectedTEI")) {
          e.target.classList.add("selectableTEI");
        }
        e.stopPropagation();
      });

      domElm.addEventListener("mouseout", (e) => {
        if (!e.target.classList.contains("selectedTEI")) {
          e.target.classList.remove("selectableTEI");
        }
        e.stopPropagation();
      });
    };

    this.contentRef.current.innerHTML = "";
    this.contentRef.current.append(
      CETEIHelper.CETEI.makeHTML5(
        data.getDocumentPerLanguage(language),
        null,
        (domElm, teiElm) => alignLogic(this.contentRef.current, domElm, teiElm),
      ),
    );
  }

  componentDidMount() {
    // Render the initial language (if any) when the component mounts.
    if (this.state.language) {
      this.refresh(this.state.language);
    }
  }

  render() {
    // Handles language selection changes in the dropdown and triggers content refresh
    const handleChange = (event) => {
      this.props.onLanguageChanged(event.target.value);
      this.setState({ language: event.target.value });
      this.refresh(event.target.value);
    };

    // Check if a refresh is needed based on props and state
    if (
      this.props.refreshNeeded != this.state.lastRefresh &&
      this.contentRef.current
    ) {
      this.setState({ lastRefresh: this.props.refreshNeeded });
      this.refresh(this.state.language);
    }

    return (
      <Box>
        <FormControl
          fullWidth
          disabled={
            data
              .getDocumentLanguages()
              .filter((language) => language !== this.props.excludeLanguage)
              .length === 0
          }
        >
          <InputLabel id={this.props.id + "-label"}>Language</InputLabel>
          <Select
            labelId={this.props.id + "-label"}
            id={this.props.id + "-select"}
            value={this.state.language}
            label="Language"
            onChange={handleChange}
          >
            {data
              .getDocumentLanguages()
              .filter((language) => language !== this.props.excludeLanguage)
              .map((language) => (
                <MenuItem
                  value={language}
                  key={this.props.id + "-key-" + language}
                >
                  {language}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {/* Content container for dynamic TEI elements */}
        <div ref={this.contentRef} />
      </Box>
    );
  }
}

export default AlignTab;
