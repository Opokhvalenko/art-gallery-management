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
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { QueryArtworkDto } from './dto/query-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
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
  findAll(@Query() query: QueryArtworkDto): Promise<ArtworkEntity[]> {
    return this.artworksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single artwork by id' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiOkResponse({ type: ArtworkEntity })
  findOne(@Param('id') id: string): Promise<ArtworkEntity> {
    return this.artworksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new artwork' })
  @ApiCreatedResponse({ type: ArtworkEntity })
  create(@Body() dto: CreateArtworkDto): Promise<ArtworkEntity> {
    return this.artworksService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing artwork (partial update)' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiOkResponse({ type: ArtworkEntity })
  update(@Param('id') id: string, @Body() dto: UpdateArtworkDto): Promise<ArtworkEntity> {
    return this.artworksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an artwork' })
  @ApiParam({ name: 'id', example: 'cmuuyh1x00000rton7b580ubs' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.artworksService.remove(id);
  }
}
