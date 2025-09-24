package com.example.demo.service;

import com.example.demo.entity.Variable;
import com.example.demo.repository.VariableRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class VariableService {

    private static final Logger LOGGER = LoggerFactory.getLogger(VariableService.class);
    private final VariableRepository variableRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String indicadoresEndpoint;

    public VariableService(
            VariableRepository variableRepository,
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${app.indicadores.ultima-url:http://10.109.1.13:3001/api/indicadores/ultima}") String indicadoresEndpoint
    ) {
        this.variableRepository = variableRepository;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = objectMapper;
        this.indicadoresEndpoint = indicadoresEndpoint;
    }

    public List<Variable> getAllVariables() {
        return variableRepository.findAll();
    }

    public List<Variable> getAllVariablesWithIndicadores() {
        List<Variable> variables = new ArrayList<>(variableRepository.findAll());
        variables.addAll(fetchExternalIndicatorVariables());
        return variables;
    }

    private List<Variable> fetchExternalIndicatorVariables() {
        try {
            String payload = restTemplate.getForObject(indicadoresEndpoint, String.class);
            if (!StringUtils.hasText(payload)) {
                return Collections.emptyList();
            }

            JsonNode root = objectMapper.readTree(payload);
            JsonNode itemsNode = resolveItemsNode(root);
            if (itemsNode == null || !itemsNode.isArray()) {
                return Collections.emptyList();
            }

            List<Variable> externalVariables = new ArrayList<>();
            for (JsonNode node : itemsNode) {
                Variable variable = mapExternalIndicator(node);
                if (variable != null) {
                    externalVariables.add(variable);
                }
            }
            return externalVariables;
        } catch (Exception ex) {
            LOGGER.warn("No fue posible obtener variables externas desde {}", indicadoresEndpoint, ex);
            return Collections.emptyList();
        }
    }

    private JsonNode resolveItemsNode(JsonNode root) {
        if (root == null) {
            return null;
        }
        if (root.isArray()) {
            return root;
        }

        for (String key : List.of("data", "results", "indicadores", "items")) {
            JsonNode candidate = getCaseInsensitive(root, key);
            if (candidate != null && candidate.isArray()) {
                return candidate;
            }
        }
        return null;
    }

    private Variable mapExternalIndicator(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }

        Variable variable = new Variable();

        String remoteId = firstTextValue(node, "idVar", "idVariable", "id", "clave", "codigo", "cve");
        if (!StringUtils.hasText(remoteId)) {
            remoteId = UUID.randomUUID().toString();
        }
        variable.setIdVar("ext-" + remoteId.replaceAll("\\s+", "-").toLowerCase(Locale.ROOT));

        String idPp = firstTextValue(node, "idPp", "idProceso", "proceso", "processId", "id_pp", "idPP");
        variable.setIdPp(StringUtils.hasText(idPp) ? idPp : "EXT_IND");

        String varAsig = firstTextValue(node, "varAsig", "nombreIndicador", "nombre", "titulo", "nombreVariable");
        if (!StringUtils.hasText(varAsig)) {
            varAsig = "Indicador importado";
        }
        variable.setVarAsig(varAsig);

        String nomVar = firstTextValue(node, "nomVar", "nombreFuente", "nombreVariable", "nombreIndicador");
        variable.setNomVar(StringUtils.hasText(nomVar) ? nomVar : varAsig);

        String tipoVar = firstTextValue(node, "tipoVar", "tipoIndicador", "tipo");
        variable.setTipoVar(StringUtils.hasText(tipoVar) ? tipoVar : "Indicador externo");

        variable.setCodIdenVar(firstTextValue(node, "codIdenVar", "clave", "codigo", "cveIndicador"));
        variable.setPregLit(firstTextValue(node, "pregLit", "pregunta", "descripcionValor", "definicionVariables"));
        variable.setTema(firstTextValue(node, "tema", "tema1", "temaPrincipal"));
        variable.setSubtema(firstTextValue(node, "subtema", "subTema", "subtema1"));
        variable.setTema2(firstTextValue(node, "tema2", "temaSecundario"));
        variable.setSubtema2(firstTextValue(node, "subtema2", "subtemaSecundario"));
        variable.setCategoria(firstTextValue(node, "categoria", "categoriaIndicador", "clasificacion"));

        String definicion = firstTextValue(node, "defVar", "descripcion", "descripcionCorta", "definicion", "descripcionIndicador");
        variable.setDefVar(StringUtils.hasText(definicion) ? definicion : "Sin descripción disponible para este indicador externo.");

        String relTab = firstTextValue(node, "relTab", "relacionTablero");
        variable.setRelTab(StringUtils.hasText(relTab) ? relTab : "No");

        String relMicro = firstTextValue(node, "relMicro", "relacionMicrodato");
        variable.setRelMicro(StringUtils.hasText(relMicro) ? relMicro : "No");

        String alinMdea = firstTextValue(node, "alinMdea", "alineacionMdea");
        variable.setAlinMdea(StringUtils.hasText(alinMdea) ? alinMdea : "No aplica");

        String alinOds = firstTextValue(node, "alinOds", "alineacionOds");
        variable.setAlinOds(StringUtils.hasText(alinOds) ? alinOds : "No aplica");

        String comentarios = firstTextValue(node, "comentVar", "notas", "observaciones", "comentarios");
        variable.setComentVar(StringUtils.hasText(comentarios) ? comentarios : "Información importada desde el servicio de indicadores externos.");

        return variable;
    }

    private String firstTextValue(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode candidate = getCaseInsensitive(node, key);
            if (candidate != null && !candidate.isNull()) {
                String value = candidate.asText();
                if (StringUtils.hasText(value)) {
                    return value.trim();
                }
            }
        }
        return "";
    }

    private JsonNode getCaseInsensitive(JsonNode node, String key) {
        if (node == null || !StringUtils.hasText(key)) {
            return null;
        }

        JsonNode direct = node.get(key);
        if (direct != null && !direct.isMissingNode()) {
            return direct;
        }

        Iterator<String> fieldNames = node.fieldNames();
        while (fieldNames.hasNext()) {
            String field = fieldNames.next();
            if (field.equalsIgnoreCase(key)) {
                return node.get(field);
            }
        }
        return null;
    }
}
