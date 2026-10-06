import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiArtworkNotFoundResponse,
  ApiValidationErrorResponse,
} from '../common/dto/error-response.dto';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { QueryArtworkDto } from './dto/query-artwork.dto';
import { ArtworkEntity } from './entities/artwork.entity';

@ApiTags('artworks')
@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  @ApiOperation({
    summary: 'List artworks, optionally sorted by price and filtered by artist/type',
  })
  @ApiOkResponse({ type: ArtworkEntity, isArray: true })
  @ApiValidationErrorResponse('Invalid query, e.g. price=sideways')
  findAll(@Query() query: QueryArtworkDto): Promise<ArtworkEntity[]> {
    return this.artworksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single artwork by id' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiOkResponse({ type: ArtworkEntity })
  @ApiArtworkNotFoundResponse()
  findOne(@Param('id') id: string): Promise<ArtworkEntity> {
    return this.artworksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new artwork' })
  @ApiCreatedResponse({ type: ArtworkEntity })
  @ApiValidationErrorResponse('Body failed validation')
  create(@Body() dto: CreateArtworkDto): Promise<ArtworkEntity> {
    return this.artworksService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace an existing artwork — same body and validation as POST' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiOkResponse({ type: ArtworkEntity })
  @ApiValidationErrorResponse('Body failed validation (full body required)')
  @ApiArtworkNotFoundResponse()
  update(@Param('id') id: string, @Body() dto: CreateArtworkDto): Promise<ArtworkEntity> {
    return this.artworksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an artwork' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiArtworkNotFoundResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.artworksService.remove(id);
  }
}
